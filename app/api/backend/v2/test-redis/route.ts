import { NextRequest, NextResponse } from "next/server";
import { Redis } from '@upstash/redis';
import IORedis from 'ioredis';

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    console.log('Testing Redis connections...');
    
    const upstashRestUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashRestToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    const REDIS_URL = process.env.REDIS_URL || (upstashRestUrl ? new URL(upstashRestUrl).host : undefined);
    const REDIS_TOKEN = process.env.REDIS_TOKEN || upstashRestToken;
    
    console.log('Redis URL:', REDIS_URL);
    console.log('Redis Token:', REDIS_TOKEN ? 'Present' : 'Missing');
    
    if (!REDIS_URL || !REDIS_TOKEN) {
      return NextResponse.json({
        success: false,
        message: 'Redis not configured',
        details: 'Set REDIS_URL and REDIS_TOKEN in environment',
      }, { status: 400 });
    }

    // Test REST client
    console.log('Testing REST client...');
    const restClient = new Redis({
      url: upstashRestUrl || `https://${REDIS_URL}`,
      token: REDIS_TOKEN,
    });
    
    const restPing = await restClient.ping();
    console.log('REST client ping result:', restPing);
    
    // Test Bull client
    console.log('Testing Bull client...');
    const bullClient = new IORedis({
      host: REDIS_URL,
      port: 6379,
      username: 'default',
      password: REDIS_TOKEN,
      tls: true,
      connectTimeout: 10000,
      enableReadyCheck: false,
      maxRetriesPerRequest: null
    });
    
    // ioredis v5 connects on first command
    const bullPing = await bullClient.ping();
    console.log('Bull client ping result:', bullPing);
    
    // Test basic operations
    console.log('Testing basic operations...');
    await restClient.set('test-key', 'test-value', { ex: 60 });
    const testValue = await restClient.get('test-key');
    console.log('Test value retrieved:', testValue);
    
    return NextResponse.json({
      success: true,
      message: "Redis connections successful",
      restPing,
      bullPing,
      testValue,
      config: {
        url: REDIS_URL,
        hasToken: !!REDIS_TOKEN
      }
    });
    
  } catch (error) {
    console.error('Redis test error:', error);
    return NextResponse.json({
      error: "Redis test failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 