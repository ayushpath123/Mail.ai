import nodemailer from 'nodemailer';

type mail_type = {
  user_details: {
    useremail: string;
    user_id: number;
  };
  groqemails: string[];
  mail_body: {
    subject: string;
    description: string;
  };
  attachmentPath?: string; // public path like /uploads/...
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function handleEmails({ user_details, groqemails, mail_body, attachmentPath }: mail_type) {
  const { subject, description } = mail_body;

  for (let i = 0; i < groqemails.length; i++) {
    const mailide = groqemails[i].replace(/\s+/g, "").toLowerCase();
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${user_details.useremail}" <${process.env.SMTP_USER}>`,
      to: mailide,
      subject,
      text: description,
      attachments: attachmentPath
        ? [
            {
              filename: attachmentPath.split('/').pop() || 'cv.pdf',
              path: attachmentPath.startsWith('/') ? `.${attachmentPath}` : attachmentPath,
              contentType: 'application/pdf',
            },
          ]
        : undefined,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${mailide}:`, info.response);
    } catch (error) {
      console.error(`Error sending email to ${mailide}:`);
    }
  }
  return true;
}
