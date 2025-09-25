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
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{queueStatus.active}</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
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
                        {getStatusIcon(campaign.status.status)}
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
                    
                    <Progress 
                      value={campaign.status.progress} 
                      className="mb-3" 
                    />
                    
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
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">Email Service</span>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 