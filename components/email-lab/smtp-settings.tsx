"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

export function SMTPSettings() {
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Load current settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/backend/v2/update-smtp');
      if (response.ok) {
        const data = await response.json();
        setSmtpUser(data.smtp_user || '');
        setIsConfigured(data.is_configured);
      }
    } catch (error) {
      console.error('Error loading SMTP settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!smtpUser || !smtpPass) {
      setMessage({ type: 'error', text: 'Please enter both email and password' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/backend/v2/update-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          smtp_user: smtpUser,
          smtp_pass: smtpPass
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'SMTP credentials saved and verified successfully!' });
        setIsConfigured(true);
        setSmtpPass(''); // Clear password field for security
      } else {
        setMessage({ 
          type: 'error', 
          text: data.details || data.error || 'Failed to save SMTP credentials' 
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          SMTP Email Settings
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure your Gmail credentials to send emails. Use an App Password, not your regular Gmail password.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConfigured && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              SMTP credentials are configured and verified.
            </AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
            {message.type === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4">
          <div>
            <Label htmlFor="smtp_user">Gmail Address</Label>
            <Input
              id="smtp_user"
              type="email"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              placeholder="your-email@gmail.com"
            />
          </div>

          <div>
            <Label htmlFor="smtp_pass">App Password</Label>
            <div className="relative">
              <Input
                id="smtp_pass"
                type={showPassword ? "text" : "password"}
                value={smtpPass}
                onChange={(e) => setSmtpPass(e.target.value)}
                placeholder="16-character app password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Generate an App Password from your Google Account settings
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={saveSettings} 
            disabled={isLoading || !smtpUser || !smtpPass}
          >
            {isLoading ? 'Testing & Saving...' : 'Save & Test'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.open('https://support.google.com/accounts/answer/185833', '_blank')}
          >
            Help: Generate App Password
          </Button>
        </div>

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">How to set up Gmail App Password:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Enable 2-Factor Authentication on your Google account</li>
            <li>Go to Google Account Settings → Security → App passwords</li>
            <li>Generate a new app password for "Mail"</li>
            <li>Use that 16-character password here (not your regular Gmail password)</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
