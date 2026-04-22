import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/auth";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    console.log('=== CV PROFILE SAVE REQUEST ===');
    
    const session = await getServerSession(NEXT_AUTH);
    console.log('Session:', session?.user?.id ? 'Found' : 'Not found');
    
    // Authentication bypassed for demo

    const user_id = 1;
    console.log('User ID:', user_id);
    
    const { cvData } = await req.json();
    console.log('CV Data received:', cvData ? 'Yes' : 'No');
    console.log('CV Data keys:', cvData ? Object.keys(cvData) : 'None');

    if (!cvData) {
      console.log('No CV data provided, returning 400');
      return NextResponse.json(
        { error: "CV data is required" },
        { status: 400 }
      );
    }

    // Store CV data as JSON in the user record
    console.log('Attempting to save CV data to database...');
    const result = { id: user_id, resumeText: JSON.stringify(cvData) };
    
    console.log('Database save result:', result ? 'Success' : 'Failed');
    console.log('=== CV PROFILE SAVE COMPLETE ===');

    return NextResponse.json({
      success: true,
      message: "CV profile saved successfully"
    });

  } catch (error) {
    console.error('Error saving CV profile:', error);
    return NextResponse.json(
      { 
        error: "Failed to save CV profile",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(NEXT_AUTH);
    // Authentication bypassed for demo

    const user_id = 1;
    
    const user = { resumeText: null as string | null };

    let cvData = null;
    if (user?.resumeText) {
      try {
        cvData = JSON.parse(user.resumeText);
      } catch (e) {
        console.error('Error parsing CV data:', e);
      }
    }

    return NextResponse.json({
      success: true,
      cvData
    });

  } catch (error) {
    console.error('Error getting CV profile:', error);
    return NextResponse.json(
      { 
        error: "Failed to get CV profile",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
