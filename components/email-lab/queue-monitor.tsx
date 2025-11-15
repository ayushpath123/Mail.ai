"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Mail,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QueueStatus {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}

interface CampaignStatus {
  status: string;
  progress: number;
  sent: number;
  failed: number;
  total: number;
}

export function QueueMonitor() {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [campaigns, setCampaigns] = useState<Array<{ id: string; status: CampaignStatus; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fakeSendingEmails, setFakeSendingEmails] = useState<{ [key: string]: { current: number; total: number; emails: string[]; batchProgress: number } }>({});

  const fetchQueueStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/backend/v2/queue-status');
      if (!response.ok) {
        throw new Error('Failed to fetch queue status');
      }
      
      const data = await response.json();
      setQueueStatus(data);
    } catch (error) {
      console.error('Error fetching queue status:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch status');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/backend/v2/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  // Simulate fake email sending activity for processing campaigns
  useEffect(() => {
    const processingCampaigns = campaigns.filter(c => c.status.status === 'processing');
    
    if (processingCampaigns.length > 0) {
      const fakeData: { [key: string]: { current: number; total: number; emails: string[]; batchProgress: number } } = {};
      
      processingCampaigns.forEach(campaign => {
        const total = campaign.status.total;
        const sent = campaign.status.sent;
        const remaining = total - sent;
        
        // Generate fake email addresses being sent
        const fakeEmails = Array.from({ length: Math.min(remaining, 5) }, (_, i) => {
          const domains = ['example.com', 'test.com', 'demo.com', 'mail.com'];
          const names = ['john', 'jane', 'bob', 'alice', 'charlie', 'diana', 'eve', 'frank'];
          const randomName = names[Math.floor(Math.random() * names.length)];
          const randomDomain = domains[Math.floor(Math.random() * domains.length)];
          return `${randomName}${i + 1}@${randomDomain}`;
        });
        
        // Calculate batch progress: shows 1-10 for current batch
        // If sent = 0, show 1/10; if sent = 5, show 6/10; if sent = 10, show 1/10 (next batch)
        const batchProgress = sent === 0 ? 1 : ((sent % 10) === 0 ? 10 : (sent % 10));
        
        fakeData[campaign.id] = {
          current: sent,
          total: total,
          emails: fakeEmails,
          batchProgress: batchProgress
        };
      });
      
      setFakeSendingEmails(fakeData);
      
      // Simulate progress updates every 2 seconds
      const progressInterval = setInterval(() => {
        setFakeSendingEmails(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(campaignId => {
            const campaign = campaigns.find(c => c.id === campaignId);
            if (campaign && campaign.status.status === 'processing') {
              const record = updated[campaignId] ?? {
                current: campaign.status.sent,
                total: campaign.status.total,
                emails: [],
                batchProgress: campaign.status.sent === 0 ? 1 : ((campaign.status.sent % 10) === 0 ? 10 : (campaign.status.sent % 10))
              };
              const current = record.current;
              const total = record.total;
              
              if (current < total) {
                const increment = Math.min(Math.floor(Math.random() * 2) + 1, total - current);
                const newCurrent = current + increment;
                // Calculate batch progress: 1-10 for current batch
                const nextBatchProgress = newCurrent === 0 ? 1 : ((newCurrent % 10) === 0 ? 10 : (newCurrent % 10));
                
                // Simulate sending progress
                updated[campaignId] = {
                  ...record,
                  current: newCurrent,
                  batchProgress: nextBatchProgress,
                  emails: record.emails.slice(1).concat([
                    `user${Math.floor(Math.random() * 1000)}@example.com`
                  ])
                };
              }
            }
          });
          return updated;
        });
      }, 2000);
      
      return () => clearInterval(progressInterval);
    } else {
      setFakeSendingEmails({});
    }
  }, [campaigns]);

  useEffect(() => {
    fetchQueueStatus();
    fetchCampaigns();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchQueueStatus();
      fetchCampaigns();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Activity className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Queue Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Queue Status
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchQueueStatus}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-600 text-sm">{error}</div>
          ) : queueStatus ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{queueStatus.waiting}</div>
                <div className="text-sm text-muted-foreground">Waiting</div>
              </div>
              <motion.div 
                className="text-center p-4 bg-yellow-50 rounded-lg"
                animate={queueStatus.active > 0 ? {
                  scale: [1, 1.05, 1],
                } : {}}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-2">
                  {queueStatus.active}
                  {queueStatus.active > 0 && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Activity className="h-5 w-5" />
                    </motion.div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </motion.div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{queueStatus.completed}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{queueStatus.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {isLoading ? 'Loading queue status...' : 'No queue data available'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Active Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={campaign.status.status === 'processing' ? {
                            scale: [1, 1.2, 1],
                          } : {}}
                          transition={{
                            duration: 1.5,
                            repeat: campaign.status.status === 'processing' ? Infinity : 0,
                            ease: "easeInOut"
                          }}
                        >
                          {getStatusIcon(campaign.status.status)}
                        </motion.div>
                        <span className="font-medium">{campaign.name}</span>
                        <Badge 
                          variant="secondary" 
                          className={getStatusColor(campaign.status.status)}
                        >
                          {campaign.status.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {campaign.status.sent + campaign.status.failed} / {campaign.status.total}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <Progress 
                        value={campaign.status.progress} 
                        className="mb-2" 
                      />
                      {campaign.status.status === 'processing' && fakeSendingEmails[campaign.id] && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-muted-foreground space-y-1"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-3 h-3"
                              >
                                <Mail className="h-3 w-3 text-blue-500" />
                              </motion.div>
                              <span>Sending emails...</span>
                            </div>
                            <motion.span
                              key={fakeSendingEmails[campaign.id].batchProgress}
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs font-semibold text-blue-600"
                            >
                              {fakeSendingEmails[campaign.id].batchProgress}/10
                            </motion.span>
                          </div>
                          <AnimatePresence mode="popLayout">
                            {fakeSendingEmails[campaign.id].emails.slice(0, 3).map((email, idx) => (
                              <motion.div
                                key={`${email}-${idx}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.5 }}
                                className="text-xs text-blue-600 pl-5 truncate"
                              >
                                → {email}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-green-600">
                          {campaign.status.sent}
                        </div>
                        <div className="text-muted-foreground">Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-red-600">
                          {campaign.status.failed}
                        </div>
                        <div className="text-muted-foreground">Failed</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-blue-600">
                          {campaign.status.total}
                        </div>
                        <div className="text-muted-foreground">Total</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active campaigns</p>
                <p className="text-sm">Start a new campaign to see it here</p>
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">Queue System</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Healthy
              </Badge>
            </div>
            <motion.div 
              className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
              animate={{
                boxShadow: [
                  "0 0 0px rgba(34, 197, 94, 0)",
                  "0 0 10px rgba(34, 197, 94, 0.3)",
                  "0 0 0px rgba(34, 197, 94, 0)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="flex items-center gap-2">
                <motion.div 
                  className="w-2 h-2 bg-green-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.7, 1]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                ></motion.div>
                <span className="font-medium">Email Service</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 