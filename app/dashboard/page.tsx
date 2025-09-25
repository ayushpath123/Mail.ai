"use client"
import React, { useEffect, useState } from "react";
import Dashboard from "@/components/Profiles/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  const { status } = useSession();
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/backend/v2/user/resume", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setResumeText(data.resumeText || "");
            setResumeUrl(data.resumeUrl || null);
          }
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    if (status === "authenticated") load();
    return () => { ignore = true };
  }, [status]);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/backend/v2/user/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText })
      });
    } finally {
      setSaving(false);
    }
  };

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/backend/v2/user/cv', {
        method: 'POST',
        body: fd
      });
      if (res.ok) {
        const data = await res.json();
        setResumeUrl(data.resumeUrl);
        if (data.resumeText) setResumeText(data.resumeText);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      <Dashboard />
      <Card>
        <CardHeader>
          <CardTitle>Resume (stored for AI use)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Input type="file" accept="application/pdf" onChange={(e) => e.target.files && onUpload(e.target.files[0])} />
            <Button disabled>{uploading ? 'Uploading...' : 'Upload PDF'}</Button>
            {resumeUrl ? <a className="text-sm underline" href={resumeUrl} target="_blank" rel="noreferrer">View current CV</a> : null}
          </div>
          <Textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste or write your resume text here..."
            rows={12}
            disabled={loading}
          />
          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


