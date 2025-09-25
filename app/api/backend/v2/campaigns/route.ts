import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/auth";
import { getCampaignStatus } from "@/actions/enhanced-queue-system";
import { Redis } from '@upstash/redis';

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

    const user_id = parseInt(session.user.id as string);
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaign_id');

    // Initialize Redis client
    const redis = new Redis({
      url: `https://${process.env.REDIS_URL || "tight-tahr-29257.upstash.io"}`,
      token: process.env.REDIS_TOKEN || "AXJJAAIjcDFjZjRjMTY3ZGIyOWM0ZjkyYTkwNDk0ZmM4YTY0Y2M0NXAxMA",
    });

    // If specific campaign ID is requested
    if (campaignId) {
      try {
        const campaignData = await redis.get(`campaign:${campaignId}`);
        if (!campaignData) {
          return NextResponse.json(
            { error: "Campaign not found" },
            { status: 404 }
          );
        }

        const campaign = JSON.parse(campaignData as string);
        const status = await getCampaignStatus(campaignId);
        
        return NextResponse.json({
          success: true,
          campaign: {
            id: campaign.id,
            name: campaign.name,
            status: status,
            created_at: campaign.created_at
          }
        });
      } catch (error) {
        console.error(`Error getting campaign ${campaignId}:`, error);
        return NextResponse.json(
          { error: "Failed to get campaign" },
          { status: 500 }
        );
      }
    }

    // Get all campaign keys for this user
    const campaignKeys = await redis.keys(`campaign:campaign_${user_id}_*`);
    
    const campaigns = [];
    
    for (const key of campaignKeys) {
      try {
        const campaignData = await redis.get(key);
        if (campaignData) {
          const campaign = JSON.parse(campaignData as string);
          const status = await getCampaignStatus(campaign.id);
          
          campaigns.push({
            id: campaign.id,
            name: campaign.name,
            status: status,
            created_at: campaign.created_at
          });
        }
      } catch (error) {
        console.error(`Error processing campaign ${key}:`, error);
      }
    }

    // Sort campaigns by creation date (newest first)
    campaigns.sort((a, b) => b.created_at - a.created_at);

    return NextResponse.json({
      success: true,
      campaigns: campaigns
    });

  } catch (error) {
    console.error('Error getting campaigns:', error);
    return NextResponse.json(
      { error: "Failed to get campaigns" },
      { status: 500 }
    );
  }
} 