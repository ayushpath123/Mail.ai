import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/auth";
// import { getQueueStatus } from "@/actions/enhanced-queue-system";

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

    // Simulate batches of 10 emails being sent and processed gradually
    const now = Date.now();
    const timeSeconds = Math.floor(now / 1000);
    const BATCH_SIZE = 10;
    const BATCH_INTERVAL = 25; // New batch every 25 seconds
    const PROCESSING_TIME = 20; // Takes ~20 seconds to process a batch
    const timeInBatch = timeSeconds % BATCH_INTERVAL;
    
    // Simulate multiple overlapping batches
    // Track the last 3 batches to show continuous processing
    let waiting = 0;
    let active = 0;
    let completed = 0;
    let failed = 0;
    
    // Process last 3 batches
    for (let i = 0; i < 3; i++) {
      const batchTime = timeSeconds - (i * BATCH_INTERVAL);
      const timeInThisBatch = batchTime % BATCH_INTERVAL;
      
      if (timeInThisBatch >= 0 && timeInThisBatch < PROCESSING_TIME) {
        const progress = Math.min(timeInThisBatch / PROCESSING_TIME, 1);
        
        // Emails move through states:
        // 0-0.3: mostly waiting, some moving to active
        // 0.3-0.7: mostly active, some moving to completed
        // 0.7-1.0: mostly completed
        
        if (progress < 0.3) {
          // Early stage: mostly waiting, some becoming active
          const movingToActive = Math.floor(progress * BATCH_SIZE * 3);
          waiting += BATCH_SIZE - movingToActive;
          active += movingToActive;
        } else if (progress < 0.7) {
          // Middle stage: mostly active, some becoming completed
          const movingToCompleted = Math.floor((progress - 0.3) * BATCH_SIZE * 2.5);
          active += BATCH_SIZE - movingToCompleted;
          completed += movingToCompleted;
        } else {
          // Late stage: mostly completed
          const remainingActive = Math.floor((1 - progress) * BATCH_SIZE * 3);
          active += remainingActive;
          completed += BATCH_SIZE - remainingActive;
        }
      } else if (timeInThisBatch >= PROCESSING_TIME) {
        // Batch is fully completed
        completed += BATCH_SIZE;
      }
    }
    
    // Add a new batch if it's time (simulate user sending 10 emails)
    if (timeInBatch < 2) {
      // New batch just started - add to waiting
      waiting += BATCH_SIZE;
    }
    
    // Ensure minimum values for visual effect
    if (waiting === 0 && active === 0 && completed === 0) {
      // Initial state - show a batch starting
      waiting = BATCH_SIZE;
    }
    
    // Add some base completed emails to show history
    const baseCompleted = 50;
    completed += baseCompleted;
    
    // Occasional failures (1-2 emails per batch, rarely)
    if (timeSeconds % 50 < 2) {
      failed = Math.floor(Math.random() * 2) + 1;
    }
    
    const fakeStatus = {
      waiting: Math.max(0, waiting),
      active: Math.max(0, active),
      completed: Math.max(0, completed),
      failed: Math.max(0, failed)
    };
    
    return NextResponse.json(fakeStatus);

    // Original code (commented out):
    // const status = await getQueueStatus();
    // return NextResponse.json(status);

  } catch (error) {
    console.error('Error getting queue status:', error);
    return NextResponse.json(
      { error: "Failed to get queue status" },
      { status: 500 }
    );
  }
} 