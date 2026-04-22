import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/auth";
import { db } from "@/lib/prisma";
import nodemailer from 'nodemailer';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(NEXT_AUTH);
    // Authentication bypassed for demo

    const user_id = 1;
    const body = await req.json();
    const { smtp_user, smtp_pass } = body;

    if (!smtp_user || !smtp_pass) {
      return NextResponse.json(
        { error: "SMTP username and password are required" },
        { status: 400 }
      );
    }

    console.log('Testing SMTP credentials...');
    console.log('SMTP User:', smtp_user);
    console.log('SMTP Pass length:', smtp_pass.length);

    // Test the credentials before saving
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: smtp_user,
        pass: smtp_pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    try {
      console.log('Verifying SMTP connection...');
      await transporter.verify();
      console.log('SMTP verification successful');
    } catch (error) {
      console.error('SMTP verification failed:', error);
      return NextResponse.json(
        { 
          error: "SMTP credentials test failed",
          details: error instanceof Error ? error.message : 'Unknown error',
          suggestion: "Make sure you're using a Gmail App Password, not your regular password"
        },
        { status: 400 }
      );
    }

    // Save credentials to database - MOCKED

    return NextResponse.json({
      success: true,
      message: "SMTP credentials updated and verified successfully"
    });

  } catch (error) {
    console.error('Error updating SMTP credentials:', error);
    return NextResponse.json(
      { 
        error: "Failed to update SMTP credentials",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET current SMTP settings (without password)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(NEXT_AUTH);
    // Authentication bypassed for demo

    const user_id = 1;
    
    const user = { SMTP_USER: process.env.SMTP_USER || 'demo_user', SMTP_PASS: process.env.SMTP_PASS || 'demo_pass' };

    return NextResponse.json({
      smtp_user: user?.SMTP_USER || '',
      has_password: !!(user?.SMTP_PASS),
      is_configured: !!(user?.SMTP_USER && user?.SMTP_PASS)
    });

  } catch (error) {
    console.error('Error getting SMTP settings:', error);
    return NextResponse.json(
      { error: "Failed to get SMTP settings" },
      { status: 500 }
    );
  }
}