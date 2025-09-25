import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { Groqfns } from "@/actions/prompt";
import { generateEmailContent } from "@/actions/ai-email-generator";
import { sendEmailsDirectly } from "@/actions/simple-email-sender";
import { db } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/auth";

// Input validation schema
const campaignInputSchema = z.object({
  // Email generation parameters
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  domain: z.string().min(2, "Domain is required"),
  
  // Email content parameters
  purpose: z.string().min(10, "Purpose must be at least 10 characters"),
  recipient_type: z.string().min(2, "Recipient type is required"),
  industry: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'friendly', 'formal']).default('professional'),
  key_points: z.array(z.string()).optional(),
  call_to_action: z.string().optional(),
  
  // Campaign settings
  campaign_name: z.string().min(1, "Campaign name is required"),
  personalize_emails: z.boolean().default(true),
  
  // Optional recipient data for personalization
  recipient_data: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
    company: z.string().optional()
  })).optional()
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(NEXT_AUTH);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user_id = parseInt(session.user.id as string);
    
    // Parse and validate input
    const body = await req.json();
    
    // Log the request body for debugging
    console.log('=== CAMPAIGN REQUEST BODY ===');
    console.log(JSON.stringify(body, null, 2));
    console.log('=== END REQUEST BODY ===');
    
    const validationResult = campaignInputSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.log('=== VALIDATION ERRORS ===');
      console.log(JSON.stringify(validationResult.error.errors, null, 2));
      console.log('=== END VALIDATION ERRORS ===');
      
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const {
      first_name,
      last_name,
      domain,
      purpose,
      recipient_type,
      industry,
      tone,
      key_points,
      call_to_action,
      campaign_name,
      personalize_emails,
      recipient_data
    } = validationResult.data;

    console.log('=== VALIDATION SUCCESS ===');
    console.log('Validated data:', {
      first_name,
      last_name,
      domain,
      purpose,
      recipient_type,
      campaign_name,
      recipient_data_count: recipient_data?.length || 0
    });
    console.log('=== END VALIDATION SUCCESS ===');

    // Check user's plan and email limits
    const user = await db.user.findUnique({
      where: { id: user_id },
      select: { plan: true, SMTP_USER: true, SMTP_PASS: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.SMTP_USER || !user.SMTP_PASS) {
      return NextResponse.json(
        { error: "SMTP credentials not configured. Please update your profile." },
        { status: 400 }
      );
    }

    // Check daily email limits based on plan
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEmails = await db.emailLog.findFirst({
      where: {
        userId: user_id,
        date: today
      }
    });

    const planLimits = {
      FREE: 50,
      STANDARD: 500,
      PREMIUM: 2000
    };

    const dailyLimit = planLimits[user.plan as keyof typeof planLimits] || 50;
    const emailsSentToday = todayEmails?.noOfEmails || 0;

    // Generate email addresses
    console.log('Generating email addresses...');
    const generatedEmails = await Groqfns({
      first_name,
      last_name,
      domain
    });

    if (!generatedEmails || generatedEmails.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate email addresses" },
        { status: 500 }
      );
    }

    // Check if we would exceed daily limit
    if (emailsSentToday + generatedEmails.length > dailyLimit) {
      return NextResponse.json(
        { 
          error: `Daily email limit exceeded. You can send ${dailyLimit - emailsSentToday} more emails today.`,
          limit: dailyLimit,
          sent: emailsSentToday,
          requested: generatedEmails.length
        },
        { status: 429 }
      );
    }

    // Fetch user's CV profile for personalization
    console.log('Fetching CV profile for user:', user_id);
    const userProfile = await db.user.findUnique({
      where: { id: user_id },
      select: { resumeText: true }
    });

    let cv_profile = null;
    if (userProfile?.resumeText) {
      try {
        cv_profile = JSON.parse(userProfile.resumeText);
        console.log('CV Profile loaded for email generation:', cv_profile ? 'Yes' : 'No');
      } catch (e) {
        console.error('Error parsing CV profile:', e);
      }
    }

    // Generate email content using AI
    console.log('Generating email content...');
    const emailContent = await generateEmailContent({
      purpose,
      recipient_type,
      industry,
      tone,
      key_points,
      call_to_action,
      sender_name: session.user.username || 'Your Name',
      sender_company: 'Your Company',
      target_domain: domain,
      cv_profile
    });

    // Create campaign ID
    const campaign_id = `campaign_${user_id}_${Date.now()}`;

    // Prepare emails for sending
    const emailsToSend = recipient_data || generatedEmails.map(email => ({ email }));
    
    // Send emails directly (no queue/redis)
    console.log('Sending emails directly...');
    const sendResult = await sendEmailsDirectly(
      emailsToSend.map(r => r.email),
      {
        subject: emailContent.subject,
        description: (emailContent as any).description || (emailContent as any).preview || ''
      },
      user_id,
      campaign_id,
      personalize_emails ? emailsToSend : undefined
    );

    if (!sendResult.success) {
      return NextResponse.json(
        { 
          error: "Failed to send emails",
          details: sendResult.errors
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email campaign completed successfully",
      campaign_id,
      sent_emails: sendResult.sent,
      failed_emails: sendResult.failed,
      total_emails: sendResult.total,
      generated_emails: generatedEmails,
      email_content: {
        subject: emailContent.subject,
        preview: (emailContent as any).description
          ? (emailContent as any).description.substring(0, 200) + '...'
          : (emailContent as any).body
          ? (emailContent as any).body.substring(0, 200) + '...'
          : ''
      },
      errors: sendResult.errors
    }, { status: 200 });

  } catch (error) {
    console.error('Error in AI email campaign:', error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint simplified (no Redis status tracking)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(NEXT_AUTH);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const campaign_id = searchParams.get('campaign_id');

    if (!campaign_id) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Simple response since emails are sent immediately
    return NextResponse.json({
      success: true,
      campaign_id,
      message: "Campaign completed immediately (no queue system)"
    });

  } catch (error) {
    console.error('Error getting campaign status:', error);
    return NextResponse.json(
      { error: "Failed to get campaign status" },
      { status: 500 }
    );
  }
} 