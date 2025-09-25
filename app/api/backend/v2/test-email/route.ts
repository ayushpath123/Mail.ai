import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import nodemailer from 'nodemailer';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    console.log('Testing email sending...');
    
    // Get a test user (first user in database)
    const testUser = await db.user.findFirst({
      select: { id: true, SMTP_USER: true, SMTP_PASS: true, email: true }
    });
    
    if (!testUser) {
      return NextResponse.json({
        error: "No users found in database"
      }, { status: 400 });
    }
    
    if (!testUser.SMTP_USER || !testUser.SMTP_PASS) {
      return NextResponse.json({
        error: "Test user has no SMTP credentials",
        user: { id: testUser.id, email: testUser.email, hasSMTP: false }
      }, { status: 400 });
    }
    
    console.log('Test user found:', { id: testUser.id, email: testUser.email, hasSMTP: true });
    
    // Create transporter
    console.log('Creating email transporter...');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: testUser.SMTP_USER,
        pass: testUser.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify transporter
    console.log('Verifying transporter...');
    await transporter.verify();
    console.log('Transporter verified successfully');

    // Send test email
    const testEmail = "test@example.com";
    console.log(`Sending test email to ${testEmail}...`);
    
    const info = await transporter.sendMail({
      from: `"Mail.ai Test" <${testUser.SMTP_USER}>`,
      to: testEmail,
      subject: "Test Email from Mail.ai",
      text: "This is a test email to verify the SMTP configuration is working correctly.",
      html: "<h1>Test Email</h1><p>This is a test email to verify the SMTP configuration is working correctly.</p>"
    });

    console.log('Test email sent successfully:', info.messageId);
    
    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      messageId: info.messageId,
      testUser: { id: testUser.id, email: testUser.email, hasSMTP: true }
    });
    
  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json({
      error: "Email test failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 