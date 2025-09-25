import { initializeQueueSystem } from '@/actions/enhanced-queue-system';

let isInitialized = false;

export async function initializeQueue() {
  if (isInitialized) {
    return;
  }

  try {
    console.log('Initializing queue system...');
    await initializeQueueSystem();
    isInitialized = true;
    console.log('Queue system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize queue system:', error);
    // Don't throw error to prevent app from crashing
    // Queue system will be initialized when first API call is made
  }
}

// Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  // Small delay to ensure all modules are loaded
  setTimeout(() => {
    initializeQueue();
  }, 1000);
} 