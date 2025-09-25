import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/auth";
import { getQueueStatus } from "@/actions/enhanced-queue-system";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(NEXT_AUTH);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const status = await getQueueStatus();
    
    return NextResponse.json(status);

  } catch (error) {
    console.error('Error getting queue status:', error);
    return NextResponse.json(
      { error: "Failed to get queue status" },
      { status: 500 }
    );
  }
} 