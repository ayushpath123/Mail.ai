"use client"

import { useSession, signOut } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueueMonitor } from "@/components/email-lab/queue-monitor";
import { AICampaignBuilder } from "@/components/email-lab/ai-campaign-builder";
import { SMTPSettings } from "@/components/email-lab/smtp-settings";
import { 
  User, 
  Mail, 
  Activity, 
  LogOut, 
  Settings,
  TrendingUp,
  Calendar,
  Target
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please sign in to access your dashboard
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {session.user?.name || (session.user as any)?.username}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <a href="/profile">
                <User className="h-4 w-4 mr-2" />
                CV Profile
              </a>
            </Button>
            <Button variant="outline" onClick={() => signOut()}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-lg">{session.user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Username</label>
                  <p className="text-lg">{(session.user as any)?.username || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account Type</label>
                  <Badge variant="secondary" className="mt-1">
                    Free Plan
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Dashboard Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="campaigns" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Campaigns
              </TabsTrigger>
              <TabsTrigger value="queue" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Queue Monitor
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Emails Sent</CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,234</div>
                    <p className="text-xs text-muted-foreground">
                      +20.1% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">
                      2 completed this week
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">94.2%</div>
                    <p className="text-xs text-muted-foreground">
                      +2.1% from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Campaign "Summer Internship" completed</p>
                        <p className="text-xs text-muted-foreground">50 emails sent successfully</p>
                      </div>
                      <span className="text-xs text-muted-foreground">2 hours ago</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New campaign "Product Launch" started</p>
                        <p className="text-xs text-muted-foreground">100 emails queued</p>
                      </div>
                      <span className="text-xs text-muted-foreground">4 hours ago</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Daily limit reached</p>
                        <p className="text-xs text-muted-foreground">Upgrade to send more emails</p>
                      </div>
                      <span className="text-xs text-muted-foreground">1 day ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="campaigns" className="space-y-6">
              <AICampaignBuilder />
            </TabsContent>

            <TabsContent value="queue" className="space-y-6">
              <QueueMonitor />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <SMTPSettings />
              
              <Card>
                <CardHeader>
                  <CardTitle>Plan Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Current Plan</label>
                      <p className="text-sm text-muted-foreground">
                        Upgrade your plan for more features
                      </p>
                      <Button variant="outline" className="mt-2">
                        Upgrade Plan
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}