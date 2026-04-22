import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/auth";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(NEXT_AUTH);

    // Authentication bypassed for demo

    const user_id = 1;

    // DEMO MOCK: Bypass Prisma
    const totalSent = 42;
    const totalFailed = 0;
    const totalAttempts = totalSent + totalFailed;
    const successRate = 100;

    const activity = [
      { date: new Date().toISOString(), sent: 42, failed: 0 }
    ];

    const recent = [
      { recipient: 'demo@dentsu.com', subject: 'Application for Software Engineer', sentAt: new Date().toISOString(), logDate: new Date().toISOString() }
    ];

    // duplicate removed
    return NextResponse.json({
      success: true,
      totals: {
        sent: totalSent,
        failed: totalFailed,
        attempts: totalAttempts,
        successRate,
      },
      activity,
      recentEmails: recent,
    });
  } catch (error) {
    console.error("Error building dashboard stats:", error);
    return NextResponse.json(
      {
        error: "Failed to load dashboard stats",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

