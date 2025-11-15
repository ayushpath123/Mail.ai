import nodemailer, { Transporter } from 'nodemailer';
import { db } from '@/lib/prisma';

interface SendEmailsResult {
  success: boolean;
  sent: number;
  failed: number;
  total: number;
  errors: string[];
}

export const sendEmailsDirectly = async (
  emails: string[],
  mail_body: { subject: string; description: string; html_body?: string },
  user_id: number,
  campaign_id: string,
  recipientData?: Array<{ email: string; name?: string; company?: string }>
): Promise<SendEmailsResult> => {
  console.log(`Starting direct email sending for campaign ${campaign_id}`);
  
  const result: SendEmailsResult = {
    success: false,
    sent: 0,
    failed: 0,
    total: emails.length,
    errors: []
  };

  try {
    // Get user's SMTP credentials
    console.log(`Fetching SMTP credentials for user ${user_id}`);
    const user = await db.user.findUnique({
      where: { id: user_id },
      select: { SMTP_USER: true, SMTP_PASS: true }
    });

    if (!user || !user.SMTP_USER || !user.SMTP_PASS) {
      throw new Error('User SMTP credentials not found');
    }

    console.log(`SMTP credentials found for user ${user_id}`);

    // Create transporter
    console.log('Creating email transporter...');
    const transporter: Transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: user.SMTP_USER,
        pass: user.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify transporter
    console.log('Verifying transporter...');
    await transporter.verify();
    console.log('Transporter verified successfully');

    // Send emails in a loop
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const recipient = recipientData?.find(r => r.email === email);

      try {
        console.log(`Sending email ${i + 1}/${emails.length} to ${email}...`);
        
        const info = await transporter.sendMail({
          from: `"Mail.ai" <${user.SMTP_USER}>`,
          to: email,
          subject: mail_body.subject,
          text: mail_body.description,
          html: mail_body.html_body || mail_body.description
        });

        console.log(`Email sent successfully to ${email}, messageId: ${info.messageId}`);
        result.sent++;

        // Log email to database
        await logEmailToDatabase({
          user_id,
          email,
          subject: mail_body.subject,
          campaign_id,
          status: 'success'
        });

        // Add a small delay to avoid rate limiting
        if (i < emails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
        result.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Failed to send to ${email}: ${errorMessage}`);
        await logEmailToDatabase({
          user_id,
          email,
          subject: mail_body.subject,
          campaign_id,
          status: 'failed',
          error: errorMessage
        });
      }
    }

    result.success = result.sent > 0;
    console.log(`Email sending completed. Sent: ${result.sent}, Failed: ${result.failed}`);
    
    return result;

  } catch (error) {
    console.error('Error in direct email sending:', error);
    result.errors.push(`Setup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
};

// Log email to database
const logEmailToDatabase = async ({
  user_id,
  email,
  subject,
  campaign_id,
  status,
  error
}: {
  user_id: number;
  email: string;
  subject: string;
  campaign_id: string;
  status: 'success' | 'failed';
  error?: string;
}) => {
  try {
    // Get or create email log for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let emailLog = await db.emailLog.findFirst({
      where: {
        userId: user_id,
        date: today
      }
    });

    if (!emailLog) {
      try {
        emailLog = await db.emailLog.create({
          data: {
            userId: user_id,
            date: today,
            noOfEmails: 0,
            failedEmails: 0
          }
        });
      } catch (createError: any) {
        // Handle case where failedEmails column doesn't exist
        if (createError?.code === 'P2022' || createError?.message?.includes('failedEmails')) {
          console.warn('failedEmails column not found, creating without it');
          emailLog = await db.emailLog.create({
            data: {
              userId: user_id,
              date: today,
              noOfEmails: 0
            }
          });
        } else {
          throw createError;
        }
      }
    }

    if (status === 'success') {
      await db.email.create({
        data: {
          emailLogId: emailLog.day_id,
          recipient: email,
          subject: subject
        }
      });

      await db.emailLog.update({
        where: { day_id: emailLog.day_id },
        data: { noOfEmails: emailLog.noOfEmails + 1 }
      });
    } else {
      // Update failed emails count - handle case where column might not exist
      try {
        await db.emailLog.update({
          where: { day_id: emailLog.day_id },
          data: { failedEmails: (emailLog.failedEmails || 0) + 1 }
        });
      } catch (updateError: any) {
        // If failedEmails column doesn't exist, just log the error
        if (updateError?.code === 'P2022' || updateError?.message?.includes('failedEmails')) {
          console.warn('failedEmails column not found in database. Please run migration.');
        } else {
          throw updateError;
        }
      }

      if (error) {
        console.warn(`Email send failure logged for ${email}: ${error}`);
      }
    }
  } catch (error) {
    console.error('Error logging email to database:', error);
  }
};
