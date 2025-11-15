"use client"

import { useEffect, useState } from "react";
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
  Target,
  XCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface DashboardTotals {
  sent: number;
  failed: number;
  attempts: number;
  successRate: number;
}

interface DashboardActivity {
  date: string;
  sent: number;
  failed: number;
}

interface DashboardRecentEmail {
  recipient: string;
  subject: string;
  sentAt: string;
  logDate?: string | null;
}

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

function formatShortDate(value: string | undefined | null) {
  if (!value) return "";
  return shortDateFormatter.format(new Date(value));
}

function formatTime(value: string | undefined | null) {
  if (!value) return "";
  return timeFormatter.format(new Date(value));
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [totals, setTotals] = useState<DashboardTotals | null>(null);
  const [activity, setActivity] = useState<DashboardActivity[]>([]);
  const [recentEmails, setRecentEmails] = useState<DashboardRecentEmail[]>([]);

  useEffect(() => {
    if (status !== "authenticated") return;

    let ignore = false;

    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const response = await fetch("/api/backend/v2/dashboard/stats", {
          cache: "no-store",
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          throw new Error(errorBody?.error || "Unable to load dashboard stats");
        }

        const data = await response.json();
        if (ignore) return;

        setTotals(data.totals || null);
        setActivity(Array.isArray(data.activity) ? data.activity : []);
        setRecentEmails(Array.isArray(data.recentEmails) ? data.recentEmails : []);
      } catch (error) {
        if (ignore) return;
        setStatsError(error instanceof Error ? error.message : "Failed to load stats");
      } finally {
        if (!ignore) {
          setStatsLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      ignore = true;
    };
  }, [status]);

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
                    <div className="text-2xl font-bold">
                      {statsLoading ? "—" : (totals?.sent ?? 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {statsLoading ? "Loading recent totals..." : "All-time delivered emails"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Failed Deliveries</CardTitle>
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statsLoading ? "—" : (totals?.failed ?? 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {statsLoading ? "Loading failure counts..." : "Total attempts that bounced or failed"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statsLoading || !totals
                        ? "—"
                        : `${totals.successRate.toFixed(1)}%`}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {statsLoading ? "Calculating..." : "Successful deliveries vs total attempts"}
                    </p>
                  </CardContent>
                </Card>
              </div>
              {statsError && (
                <p className="text-sm text-red-600">
                  Failed to load latest stats: {statsError}
                </p>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="text-sm text-muted-foreground">Loading activity...</div>
                  ) : activity.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No email activity yet. Start a campaign to see analytics here.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activity.slice(-5).reverse().map((item) => (
                        <div className="flex items-center gap-4" key={item.date}>
                          <div
                            className={`w-2 h-2 rounded-full ${
                              item.failed > 0 ? "bg-red-500" : "bg-green-500"
                            }`}
                          ></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {formatShortDate(item.date)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.sent} sent • {item.failed} failed
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(item.date)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Emails</CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="text-sm text-muted-foreground">Loading recent emails...</div>
                  ) : recentEmails.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      Once you start sending, the latest recipients and subjects will appear here.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentEmails.map((email) => (
                        <div key={`${email.recipient}-${email.sentAt}`} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{email.subject}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatShortDate(email.sentAt)} · {formatTime(email.sentAt)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            To: {email.recipient}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
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