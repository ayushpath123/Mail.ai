import { Queue, Worker, Job } from 'bullmq';
import { Redis } from '@upstash/redis';
import nodemailer, { Transporter } from 'nodemailer';
import IORedis from 'ioredis';

// Types
interface MailBody {
  subject: string;
  description: string;
}

interface SetupType {
  user_id: number;
  groqemails: string[];
  mail_body: MailBody;
}

interface EmailJob {
  email: string;
  mail_body: MailBody;
  timestamp: number;
}

// Redis Configuration
const REDIS_URL = "tight-tahr-29257.upstash.io";
const REDIS_TOKEN = "AXJJAAIjcDFjZjRjMTY3ZGIyOWM0ZjkyYTkwNDk0ZmM4YTY0Y2M0NXAxMA";

// Create Redis clients
const createRedisClients = () => {
  // Upstash Redis client for REST operations
  const restClient = new Redis({
    url: `https://${REDIS_URL}`,
    token: REDIS_TOKEN,
  });

  // IORedis client for BullMQ
  //@ts-ignore
  const bullClient = new IORedis({
    host: REDIS_URL,
    port: 6379,
    username: 'default',  // Upstash default username
    password: REDIS_TOKEN,
    tls: true,
    connectTimeout: 10000,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times: number) => {
      if (times > 3) return null;
      return Math.min(times * 1000, 3000);
    }
  });

  return { restClient, bullClient };
};

export const handleUserEmails = async ({ user_id, groqemails, mail_body }: SetupType): Promise<{ success: boolean; message: string }> => {
  console.log('Starting email processing...');
  
  try {
    const { restClient, bullClient } = createRedisClients();

    // Test REST client connection
    try {
      const pingResult = await restClient.ping();
      console.log('REST client ping result:', pingResult);
    } catch (error) {
      console.error('REST client connection error:', error);
      throw new Error('Failed to connect to Redis REST client');
    }

    // Test Bull client connection
    try {
      await bullClient.ping();
      console.log('Bull client connection successful');
    } catch (error) {
      console.error('Bull client connection error:', error);
      throw new Error('Failed to connect to Redis Bull client');
    }

    const queueName = `user-${user_id}`;

    // Initialize queue with Bull client
    const queue = new Queue<EmailJob>(queueName, {
      connection: bullClient
    });

    console.log('Queue initialized');

    // Initialize worker
    const worker = new Worker<EmailJob>(
      queueName,
      async (job: Job<EmailJob>) => {
        console.log(`Processing job ${job.id} for email: ${job.data.email}`);
        
        try {
          // Email configuration
          const transporter: Transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
              user: 'ayushpathak308@gmail.com',
              pass: 'mkol tlrl vhta tagx'
            }
          });

          // Send email
          const info = await transporter.sendMail({
            from: 'ayushpathak308@gmail.com',
            to: job.data.email,
            subject: job.data.mail_body.subject,
            html: job.data.mail_body.description
          });

          console.log('Email sent successfully:', info.messageId);
          
          // Store result using REST client
          await restClient.set(
            `processed-email:${job.id}`, 
            JSON.stringify({
              email: job.data.email,
              messageId: info.messageId,
              status: 'completed',
              processedAt: Date.now()
            }),
            { ex: 86400 }
          );
        } catch (error) {
          console.error('Error processing email:', error);
          throw error;
        }
      },
      { 
        connection: bullClient,
        concurrency: 5,
      }
    );

    // Monitor Redis connection state
    bullClient.on('connect', () => {
      console.log('Redis client connected');
    });

    bullClient.on('error', (err) => {
      console.error('Redis client error:', err);
    });

    bullClient.on('ready', () => {
      console.log('Redis client ready');
    });

    // Add jobs to queue with error handling
    console.log('Adding jobs to queue...');
    for (const email of groqemails) {
      try {
        await queue.add(
          'send-email',
          {
            email,
            mail_body,
            timestamp: Date.now()
          },
          {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000
            }
          }
        );
        console.log(`Job added for email: ${email}`);
      } catch (error) {
        console.error(`Failed to add job for email ${email}:`, error);
      }
    }

    // Handle worker events
    worker.on('completed', (job: Job<EmailJob> | undefined) => {
      if (job) {
        console.log(`Job ${job.id} completed for email: ${job.data.email}`);
      }
    });

    worker.on('failed', (job: Job<EmailJob> | undefined, error: Error) => {
      if (job) {
        console.error(`Job ${job.id} failed for email: ${job.data.email}:`, error);
      }
    });

    // Cleanup handler
    const cleanup = async (): Promise<void> => {
      console.log('Cleaning up connections...');
      await worker.close();
      await queue.close();
      await bullClient.quit();
    };

    process.on('SIGTERM', cleanup);
    process.on('SIGINT', cleanup);

    return { success: true, message: `Added ${groqemails.length} emails to queue` };

  } catch (error) {
    console.error('Error in handleUserEmails:', error);
    throw error;
  }
};

// Test function
const testEmails = async (): Promise<void> => {
  try {
    const testData: SetupType = {
      user_id: 123,
      groqemails: ['test@example.com'],
      mail_body: {
        subject: 'Test Email',
        description: 'This is a test email'
      }
    };

    const result = await handleUserEmails(testData);
    console.log('Test result:', result);
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// For direct testing
if (require.main === module) {
  testEmails();
}