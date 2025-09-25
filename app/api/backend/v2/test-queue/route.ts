import { NextRequest, NextResponse } from "next/server";
import { initializeQueueSystem, addEmailsToQueue, getQueueStatus } from "@/actions/enhanced-queue-system";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    console.log('Testing queue system...');
    
    // Initialize queue system
    await initializeQueueSystem();
    console.log('Queue system initialized');
    
    // Get queue status
    const status = await getQueueStatus();
    console.log('Queue status:', status);
    
    // Test with a single email
    const testEmail = "test@example.com";
    const testContent = {
      subject: "Test Email from Mail.ai",
      description: "This is a test email to verify the queue system is working.",
      html_body: "<h1>Test Email</h1><p>This is a test email to verify the queue system is working.</p>"
    };
    
    // Get a test user (first user in database)
    const testUser = await db.user.findFirst({
      select: { id: true, SMTP_USER: true, SMTP_PASS: true }
    });
    
    if (!testUser) {
      return NextResponse.json({
        error: "No users found in database",
        status
      }, { status: 400 });
    }
    
    if (!testUser.SMTP_USER || !testUser.SMTP_PASS) {
      return NextResponse.json({
        error: "Test user has no SMTP credentials",
        user: { id: testUser.id, hasSMTP: false },
        status
      }, { status: 400 });
    }
    
    console.log('Test user found:', { id: testUser.id, hasSMTP: true });
    
    // Add test email to queue
    const campaignId = `test_campaign_${Date.now()}`;
    const queueResult = await addEmailsToQueue(
      [testEmail],
      testContent,
      testUser.id,
      campaignId
    );
    
    console.log('Queue result:', queueResult);
    
    // Wait a moment and check status again
    await new Promise(resolve => setTimeout(resolve, 2000));
    const statusAfter = await getQueueStatus();
    
    return NextResponse.json({
      success: true,
      message: "Queue test completed",
      initialStatus: status,
      finalStatus: statusAfter,
      queueResult,
      testUser: { id: testUser.id, hasSMTP: true },
      campaignId
    });
    
  } catch (error) {
    console.error('Queue test error:', error);
    return NextResponse.json({
      error: "Queue test failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('Getting queue status...');
    
    // Initialize queue system
    await initializeQueueSystem();
    
    // Get queue status
    const status = await getQueueStatus();
    
    return NextResponse.json({
      success: true,
      status
    });
    
  } catch (error) {
    console.error('Error getting queue status:', error);
    return NextResponse.json({
      error: "Failed to get queue status",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 