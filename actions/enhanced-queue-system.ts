import { Queue, Worker, Job } from 'bullmq';
import { Redis } from '@upstash/redis';
import nodemailer, { Transporter } from 'nodemailer';
import IORedis from 'ioredis';
import { db } from '@/lib/prisma';

// Types
interface EmailJobData {
  email: string;
  recipientName?: string;
  companyName?: string;
  mail_body: {
    subject: string;
    description: string;
    html_body?: string;
  };
  user_id: number;
  campaign_id: string;
  timestamp: number;
}

interface EmailCampaign {
  id: string;
  user_id: number;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_emails: number;
  sent_emails: number;
  failed_emails: number;
  created_at: Date;
  completed_at?: Date;
}

interface UserEmailCredentials {
  SMTP_USER: string;
  SMTP_PASS: string;
  sender_name?: string;
  sender_company?: string;
}

// Redis configuration
const createRedisClients = () => {
  const upstashRestUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashRestToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  const REDIS_URL = process.env.REDIS_URL || (upstashRestUrl ? new URL(upstashRestUrl).host : undefined);
  const REDIS_TOKEN = process.env.REDIS_TOKEN || upstashRestToken;

  if (!REDIS_URL || !REDIS_TOKEN) {
    throw new Error('Redis not configured: set REDIS_URL/REDIS_TOKEN or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN');
  }

  // REST client for Upstash Redis
  const restClient = new Redis({
    url: upstashRestUrl || `https://${REDIS_URL}`,
    token: REDIS_TOKEN,
  });

  // Bull client for queue operations
  const bullClient = new IORedis({
    host: REDIS_URL,
    port: 6379,
    username: 'default',
    password: REDIS_TOKEN,
    tls: true,
    connectTimeout: 3000,
    enableReadyCheck: false,
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    retryStrategy: (times: number) => {
      if (times > 3) return null;
      return Math.min(times * 500, 1500);
    }
  });

  return { restClient, bullClient };
};

// Global queue and worker instances
let emailQueue: Queue<EmailJobData>;
let emailWorker: Worker<EmailJobData>;
// For BullMQ v5 we can use QueueEvents if needed; removing unused scheduler
let isInitialized = false;

// Initialize the queue system
export const initializeQueueSystem = async () => {
  if (isInitialized) {
    console.log('Queue system already initialized');
    return true;
  }

  try {
    console.log('Starting queue system initialization...');
    const { restClient, bullClient } = createRedisClients();

    // Try pings but don't block initialization
    console.log('Testing Redis connections (non-blocking)...');
    (async () => {
      try {
        await Promise.race([
          Promise.all([
            restClient.ping(),
            bullClient.ping()
          ]),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Redis ping timeout')), 3000))
        ]);
        console.log('Redis connections verified');
      } catch (e) {
        console.warn('Redis ping check skipped/failed (continuing):', (e as Error).message);
      }
    })();

    // Initialize queue
    console.log('Initializing email queue...');
    emailQueue = new Queue<EmailJobData>('email-queue', {
      connection: bullClient,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: 100,
        removeOnFail: 50
      }
    });

    // Queue scheduler removed for BullMQ v5; delayed jobs are supported via opts

    // Initialize worker with explicit start
    console.log('Initializing email worker...');
    emailWorker = new Worker<EmailJobData>(
      'email-queue',
      async (job: Job<EmailJobData>) => {
        console.log(`Processing job ${job.id} for email: ${job.data.email}`);
        return await processEmailJob(job);
      },
      {
        connection: bullClient,
        concurrency: 5, // Reduced concurrency for better stability
        autorun: false // Don't auto-start, we'll start manually
      }
    );

    // Set up event handlers
    setupWorkerEvents(emailWorker);
    setupQueueEvents(emailQueue);

    // Start the worker explicitly (in background)
    console.log('Starting email worker...');
    emailWorker.run().then(() => {
      console.log('Email worker running');
    }).catch((err) => {
      console.error('Email worker failed to start:', err);
    });

    isInitialized = true;
    console.log('Queue system initialized and worker started successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize queue system (continuing, will retry on demand):', error);
    // Mark as initialized to prevent repeated blocking in handlers; jobs will wait until connection becomes ready
    isInitialized = true;
    return false;
  }
};

// Process individual email job
const processEmailJob = async (job: Job<EmailJobData>): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const { email, mail_body, user_id, campaign_id } = job.data;
  
  console.log(`Starting to process email job ${job.id} for ${email}`);
  
  try {
    // Get user's SMTP credentials
    console.log(`Fetching SMTP credentials for user ${user_id}`);
    const user = await db.user.findUnique({
      where: { id: user_id },
      select: { SMTP_USER: true, SMTP_PASS: true }
    });

    if (!user || !user.SMTP_USER || !user.SMTP_PASS) {
      throw new Error('User SMTP credentials not found');
    }

    console.log(`SMTP credentials found for user ${user_id}`);

    // Create transporter
    console.log('Creating email transporter...');
    const transporter: Transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: user.SMTP_USER,
        pass: user.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify transporter
    console.log('Verifying transporter...');
    await transporter.verify();

    // Send email
    console.log(`Sending email to ${email}...`);
    const info = await transporter.sendMail({
      from: `"Mail.ai" <${user.SMTP_USER}>`,
      to: email,
      subject: mail_body.subject,
      text: mail_body.description,
      html: mail_body.html_body || mail_body.description
    });

    console.log(`Email sent successfully to ${email}, messageId: ${info.messageId}`);

    // Update campaign progress
    await updateCampaignProgress(campaign_id, 'sent');

    // Log email to database
    await logEmailToDatabase(user_id, email, mail_body.subject, campaign_id);

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error(`Error processing email job ${job.id} for ${email}:`, error);
    
    // Update campaign progress
    await updateCampaignProgress(campaign_id, 'failed');
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Set up worker event handlers
const setupWorkerEvents = (worker: Worker<EmailJobData>) => {
  worker.on('completed', async (job: Job<EmailJobData>) => {
    console.log(`Email job ${job.id} completed successfully for ${job.data.email}`);
    
    // Store completion status
    const { restClient } = createRedisClients();
    await restClient.set(
      `email-status:${job.id}`,
      JSON.stringify({
        status: 'completed',
        email: job.data.email,
        completedAt: Date.now()
      }),
      { ex: 86400 }
    );
  });

  worker.on('failed', async (job: Job<EmailJobData> | undefined, error: Error) => {
    if (job) {
      console.error(`Email job ${job.id} failed for ${job.data.email}:`, error);
      
      // Store failure status
      const { restClient } = createRedisClients();
      await restClient.set(
        `email-status:${job.id}`,
        JSON.stringify({
          status: 'failed',
          email: job.data.email,
          error: error.message,
          failedAt: Date.now()
        }),
        { ex: 86400 }
      );
    }
  });

  worker.on('error', (error: Error) => {
    console.error('Worker error:', error);
  });
};

// Set up queue event handlers
const setupQueueEvents = (queue: Queue<EmailJobData>) => {
  // BullMQ v5 no longer exposes on('waiting'|'active'|'stalled') on Queue
};

// Add emails to queue
export const addEmailsToQueue = async (
  emails: string[],
  mail_body: { subject: string; description: string; html_body?: string },
  user_id: number,
  campaign_id: string,
  recipientData?: Array<{ email: string; name?: string; company?: string }>
): Promise<{ success: boolean; queuedCount: number; errors: string[] }> => {
  try {
    if (!emailQueue) {
      throw new Error('Queue system not initialized');
    }

    const errors: string[] = [];
    let queuedCount = 0;

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const recipient = recipientData?.find(r => r.email === email);

      try {
        await emailQueue.add(
          'send-email',
          {
            email,
            recipientName: recipient?.name,
            companyName: recipient?.company,
            mail_body,
            user_id,
            campaign_id,
            timestamp: Date.now()
          },
          {
            delay: i * 1000, // Stagger emails by 1 second to avoid rate limiting
            jobId: `${campaign_id}-${i}`,
            removeOnComplete: true,
            removeOnFail: false
          }
        );
        queuedCount++;
      } catch (error) {
        const errorMsg = `Failed to queue email ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    return {
      success: queuedCount > 0,
      queuedCount,
      errors
    };
  } catch (error) {
    console.error('Error adding emails to queue:', error);
    throw error;
  }
};

// Get queue status
export const getQueueStatus = async (): Promise<{
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}> => {
  if (!emailQueue) {
    throw new Error('Queue system not initialized');
  }

  const [waiting, active, completed, failed] = await Promise.all([
    emailQueue.getWaiting(),
    emailQueue.getActive(),
    emailQueue.getCompleted(),
    emailQueue.getFailed()
  ]);

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length
  };
};

// Get campaign status
export const getCampaignStatus = async (campaign_id: string): Promise<{
  status: string;
  progress: number;
  sent: number;
  failed: number;
  total: number;
}> => {
  const { restClient } = createRedisClients();
  
  const campaignData = await restClient.get(`campaign:${campaign_id}`);
  
  if (!campaignData) {
    return {
      status: 'not_found',
      progress: 0,
      sent: 0,
      failed: 0,
      total: 0
    };
  }

  const campaign = JSON.parse(campaignData as string);
  const progress = campaign.total > 0 ? ((campaign.sent + campaign.failed) / campaign.total) * 100 : 0;

  return {
    status: campaign.status,
    progress: Math.round(progress),
    sent: campaign.sent,
    failed: campaign.failed,
    total: campaign.total
  };
};

// Update campaign progress
const updateCampaignProgress = async (campaign_id: string, type: 'sent' | 'failed') => {
  try {
    const { restClient } = createRedisClients();
    
    const campaignData = await restClient.get(`campaign:${campaign_id}`);
    
    if (campaignData) {
      const campaign = JSON.parse(campaignData as string);
      
      if (type === 'sent') {
        campaign.sent++;
      } else {
        campaign.failed++;
      }

      // Check if campaign is complete
      if (campaign.sent + campaign.failed >= campaign.total) {
        campaign.status = 'completed';
        campaign.completed_at = Date.now();
      }

      await restClient.set(`campaign:${campaign_id}`, JSON.stringify(campaign), { ex: 86400 });
    }
  } catch (error) {
    console.error('Error updating campaign progress:', error);
  }
};

// Log email to database
const logEmailToDatabase = async (
  user_id: number,
  email: string,
  subject: string,
  campaign_id: string
) => {
  try {
    // Get or create email log for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let emailLog = await db.emailLog.findFirst({
      where: {
        userId: user_id,
        date: today
      }
    });

    if (!emailLog) {
      emailLog = await db.emailLog.create({
        data: {
          userId: user_id,
          date: today,
          noOfEmails: 0
        }
      });
    }

    // Create email record
    await db.email.create({
      data: {
        emailLogId: emailLog.day_id,
        recipient: email,
        subject: subject
      }
    });

    // Update email count
    await db.emailLog.update({
      where: { day_id: emailLog.day_id },
      data: { noOfEmails: emailLog.noOfEmails + 1 }
    });
  } catch (error) {
    console.error('Error logging email to database:', error);
  }
};

// Cleanup function
export const cleanupQueueSystem = async () => {
  try {
    if (emailWorker) {
      await emailWorker.close();
    }
    if (emailQueue) {
      await emailQueue.close();
    }
    console.log('Queue system cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up queue system:', error);
  }
}; 