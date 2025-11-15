import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/auth";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(NEXT_AUTH);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user_id = parseInt(session.user.id as string);

    const [totalsAggregate, recentLogs, recentEmails] = await Promise.all([
      db.emailLog.aggregate({
        where: { userId: user_id },
        _sum: {
          noOfEmails: true,
          failedEmails: true,
        },
      }).catch((error: any) => {
        // Handle case where failedEmails column doesn't exist
        if (error?.code === 'P2022' || error?.message?.includes('failedEmails')) {
          console.warn('failedEmails column not found, using fallback');
          return { _sum: { noOfEmails: 0, failedEmails: null } };
        }
        throw error;
      }),
      db.emailLog.findMany({
        where: { userId: user_id },
        orderBy: { date: "desc" },
        take: 14,
      }),
      db.email.findMany({
        where: {
          emailLog: {
            userId: user_id,
          },
        },
        orderBy: { sentAt: "desc" },
        take: 6,
        include: {
          emailLog: {
            select: { date: true },
          },
        },
      }),
    ]);

    const totalSent = totalsAggregate._sum.noOfEmails || 0;
    const totalFailed = totalsAggregate._sum.failedEmails || 0;
    const totalAttempts = totalSent + totalFailed;
    const successRate =
      totalAttempts === 0 ? 0 : Math.round((totalSent / totalAttempts) * 1000) / 10;

    const activity = recentLogs
      .map((log) => ({
        date: log.date.toISOString(),
        sent: log.noOfEmails,
        failed: (log as any).failedEmails || 0, // Handle missing column gracefully
      }))
      .reverse();

    const recent = recentEmails.map((email) => ({
      recipient: email.recipient,
      subject: email.subject,
      sentAt: email.sentAt.toISOString(),
      logDate: email.emailLog?.date.toISOString(),
    }));

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

