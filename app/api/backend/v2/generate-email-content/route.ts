import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { generateEmailContent } from "@/actions/ai-email-generator";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Get user session for CV profile
    const session = await getServerSession(NEXT_AUTH);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user_id = parseInt(session.user.id as string);
    const body = await req.json();
    
    const {
      purpose,
      recipient_type,
      industry,
      tone,
      key_points,
      call_to_action,
      sender_name,
      sender_company,
      target_domain,
      target_company
    } = body;

    if (!purpose || !recipient_type) {
      return NextResponse.json(
        { error: "Purpose and recipient type are required" },
        { status: 400 }
      );
    }

    // Fetch user's CV profile
    console.log('Fetching CV profile for user:', user_id);
    const user = await db.user.findUnique({
      where: { id: user_id },
      select: { resumeText: true }
    });

    let cv_profile = null;
    let cv_raw_text: string | null = null;
    if (user?.resumeText && user.resumeText.trim().length > 0) {
      cv_raw_text = user.resumeText;
      try {
        cv_profile = JSON.parse(user.resumeText);
        console.log('CV Profile loaded:', cv_profile ? 'Yes' : 'No');
      } catch (e) {
        console.error('Error parsing CV profile:', e);
      }
    }

    console.log('Generating email content with AI for:', {
      purpose: purpose.substring(0, 50) + '...',
      recipient_type,
      tone,
      industry,
      target_domain,
      cv_available: !!cv_profile
    });

    const emailContent = await generateEmailContent({
      purpose,
      recipient_type,
      industry,
      tone,
      key_points,
      call_to_action,
      sender_name,
      sender_company,
      target_domain,
      target_company,
      cv_profile,
      cv_raw_text
    });

    return NextResponse.json({
      success: true,
      subject: emailContent.subject,
      description: emailContent.description,
      html_body: emailContent.html_body
    });

  } catch (error) {
    console.error('Error generating email content:', error);
    return NextResponse.json(
      { 
        error: "Failed to generate email content",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
