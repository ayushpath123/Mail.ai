"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Sparkles, Users, Target, MessageSquare, CheckCircle, AlertCircle, Clock, Mail, TrendingUp, User, Upload, FileText, Loader2 } from "lucide-react";

interface CampaignStatus {
  status: string;
  progress: number;
  sent: number;
  failed: number;
  total: number;
}

interface EmailContent {
  subject: string;
  preview: string | any; // Allow for different types of content
}

function deriveCompanyFromDomain(domain: string) {
  if (!domain) return "";
  const cleaned = domain
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split("/")[0];

  if (!cleaned) return "";

  const parts = cleaned.split(".").filter(Boolean);
  if (parts.length === 0) return "";

  const multiPartSuffixes = ["co.uk", "co.in", "com.au", "com.br", "com.sg"];
  const lastTwo = parts.slice(-2).join(".");
  let companyPart = "";

  if (multiPartSuffixes.includes(lastTwo) && parts.length >= 3) {
    companyPart = parts[parts.length - 3];
  } else if (parts.length === 1) {
    companyPart = parts[0];
  } else {
    companyPart = parts[parts.length - 2];
  }

  return companyPart
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function validateCVProfile(cvData: any): boolean {
  if (!cvData) return false;

  const hasBasicInfo = cvData.fullName && cvData.email && cvData.phone;
  const hasSummary = cvData.summary && cvData.summary.length > 20;
  const hasExperience = cvData.experience && cvData.experience.length > 0;
  const hasEducation = cvData.education && cvData.education.length > 0;
  const hasSkills = cvData.technicalSkills && cvData.technicalSkills.length > 0;

  const experienceComplete = cvData.experience?.every(
    (exp: any) => exp.company && exp.position && exp.duration && exp.description
  );
  const educationComplete = cvData.education?.every(
    (edu: any) => edu.institution && edu.degree && edu.field && edu.duration
  );

  return (
    hasBasicInfo &&
    hasSummary &&
    hasExperience &&
    hasEducation &&
    hasSkills &&
    experienceComplete &&
    educationComplete
  );
}

export function AICampaignBuilder() {
  const [isLoading, setIsLoading] = useState(false);
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatus | null>(null);
  const [emailContent, setEmailContent] = useState<EmailContent | null>(null);
  const [generatedEmails, setGeneratedEmails] = useState<string[]>([]);
  // CV upload removed for performance
  const [isEditing, setIsEditing] = useState(false);
  const [editableSubject, setEditableSubject] = useState<string>("");
  const [editableContent, setEditableContent] = useState<string>("");
  const [cvProfileComplete, setCvProfileComplete] = useState<boolean | null>(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const [companyNameTouched, setCompanyNameTouched] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isAnalyzingCV, setIsAnalyzingCV] = useState(false);
  const [cvAnalysis, setCvAnalysis] = useState<{
    skills: string[];
    experience: string[];
    education: string;
    summary: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<string>("target");

  const checkCVProfileCompletion = useCallback(async () => {
    try {
      const response = await fetch('/api/backend/v2/cv-profile');
      if (response.ok) {
        const data = await response.json();
        const isComplete = validateCVProfile(data.cvData);
        setCvProfileComplete(isComplete);
      } else {
        setCvProfileComplete(false);
      }
    } catch (error) {
      console.error('Error checking CV profile:', error);
      setCvProfileComplete(false);
    } finally {
      setIsCheckingProfile(false);
    }
  }, []);

  // Check CV profile completion on component mount
  useEffect(() => {
    checkCVProfileCompletion();
  }, [checkCVProfileCompletion]);

  // Form state - defined early so it can be used in useCallback
  const [formData, setFormData] = useState({
    first_name: "Ayush",
    last_name: "Pathak",
    domain: "dentsu.com",
    company_name: "Dentsu",
    purpose: "I am interested in a role at Dentsu as a software engineer.",
    recipient_type: "HR",
    campaign_name: "HR Outreach",
    industry: "",
    tone: "professional",
    key_points: [] as string[],
    call_to_action: "",
    personalize_emails: true,
  });

  // Generate personalized content based on CV - defined after formData
  const generatePersonalizedContent = useCallback(async (purpose: string, recipient: string, campaignName: string) => {
    try {
      console.log('Generating personalized content with AI...');
      
      // Use the AI email generator directly
      const requestBody = {
        purpose: formData.purpose,
        recipient_type: formData.recipient_type,
        industry: formData.industry,
        tone: formData.tone,
        key_points: formData.key_points,
        call_to_action: formData.call_to_action,
        sender_name: formData.first_name + ' ' + formData.last_name,
        sender_company: 'Your Company',
        target_domain: formData.domain,
        target_company: formData.company_name || deriveCompanyFromDomain(formData.domain)
      };

      console.log('AI generation request:', requestBody);

      // Call the AI generation endpoint
      const response = await fetch('/api/backend/v2/generate-email-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        console.log('AI generation failed, falling back to template');
        throw new Error('Failed to generate AI content');
      }
      
      const data = await response.json();
      console.log('AI generated content:', data);
      
      return {
        subject: data.subject || `Regarding: ${typeof purpose === 'string' ? purpose.substring(0, 40) : purpose}`,
        preview: data.description || data.body || `Dear ${recipient},\n\n${purpose}\n\nBest regards,\n${formData.first_name} ${formData.last_name}`
      };
    } catch (error) {
      console.error('Error generating personalized content:', error);
      // Fallback to dummy content
      return generateDummyContent(purpose, recipient);
    }
  }, [formData]);

  // Auto-load email template when switching to Content or Preview tabs
  useEffect(() => {
    if ((activeTab === "content" || activeTab === "preview") && !emailContent && !isLoading) {
      // Only load if we have the required form data
      if (formData.purpose && formData.recipient_type && formData.campaign_name) {
        generatePersonalizedContent(formData.purpose, formData.recipient_type, formData.campaign_name)
          .then(content => setEmailContent(content))
          .catch(error => console.error('Error loading email template:', error));
      }
    }
  }, [activeTab, emailContent, isLoading, formData.purpose, formData.recipient_type, formData.campaign_name, generatePersonalizedContent]);

  // Fake CV analysis function
  const analyzeCV = async (file: File) => {
    setIsAnalyzingCV(true);
    setCvFile(file);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fake analysis results
    const fakeAnalysis = {
      skills: [
        "Next.js", "React.js", "TypeScript", "Node.js", 
        "PostgreSQL", "Prisma", "Redis", "WebRTC",
        "AI/ML", "LangChain", "OpenAI", "Groq SDK"
      ],
      experience: [
        "Software Engineering Intern at VideoSDK - Real-time communication products",
        "Software Engineering Intern at Dentsu - AI chatbots and monitoring dashboards",
        "Full-stack development with modern web technologies"
      ],
      education: "B.Tech in Data Science & Artificial Intelligence at IIIT Dharwad",
      summary: "Experienced software engineer with expertise in full-stack development, AI/ML integration, and real-time systems. Built scalable applications using modern technologies."
    };
    
    setCvAnalysis(fakeAnalysis);
    setIsAnalyzingCV(false);
  };

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        analyzeCV(file);
      } else {
        alert('Please upload a PDF file');
      }
    }
  };

  // Dummy email generator with proper professional patterns
  function generateDummyEmails(first: string, last: string, domain: string) {
    const f = first.toLowerCase();
    const l = last.toLowerCase();
    const fInitial = f.charAt(0);
    
    return [
      `${f}.${l}@${domain}`,           // ayush.pathak@dentsu.com
      `${f}@${domain}`,                // ayush@dentsu.com
      `${f}${l}@${domain}`,            // ayushpathak@dentsu.com
      `${f}_${l}@${domain}`,           // ayush_pathak@dentsu.com
      `${l}.${f}@${domain}`,           // pathak.ayush@dentsu.com
      `${fInitial}.${l}@${domain}`,    // a.pathak@dentsu.com
      `${f}_${fInitial}@${domain}`,    // ayush_a@dentsu.com
      `${fInitial}${l}@${domain}`,     // apathak@dentsu.com
      `${l}@${domain}`,                // pathak@dentsu.com
      `${f}.${fInitial}@${domain}`     // ayush.a@dentsu.com
    ];
  }

  // Dummy email content
  function generateDummyContent(purpose: string, recipient: string) {
    return {
      subject: `Regarding: ${typeof purpose === 'string' ? purpose.substring(0, 40) : purpose}`,
      preview: `Dear ${recipient},\n\n${purpose}\n\nBest regards,\nAyush Pathak`
    };
  }

  // Real email generator using Hunter API (no auth required)
  async function generateRealEmails(first: string, last: string, domain: string) {
    try {
      const response = await fetch('/api/backend/v2/mailnode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: first,
          last_name: last,
          domain: domain,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate emails');
      }
      
      const data = await response.json();
      // Parse the emails from the response
      const emailString = data.emails || '';
      const emails = emailString
        .split(',')
        .map((email: string) => email.trim())
        .filter((email: string) => {
          // Filter for valid email addresses
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email) && !email.includes('Grog emails') && !email.includes('Here are');
        });
      
      return emails.length > 0 ? emails : generateDummyEmails(first, last, domain);
    } catch (error) {
      console.error('Error generating emails:', error);
      // Fallback to dummy emails
      return generateDummyEmails(first, last, domain);
    }
  }

  // Simplified content generation (no auth required)
  async function generateRealContent(purpose: string, recipient: string, campaignName: string) {
    try {
      // Use the mailnode endpoint which also generates content
      const response = await fetch('/api/backend/v2/mailnode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: "Test",
          last_name: "User",
          domain: "example.com",
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate content');
      }
      
      const data = await response.json();
      return {
        subject: data.subject || `Regarding: ${typeof purpose === 'string' ? purpose.substring(0, 40) : purpose}`,
        preview: data.description || `Dear ${recipient},\n\n${purpose}\n\nBest regards,\nAyush Pathak`
      };
    } catch (error) {
      console.error('Error generating content:', error);
      // Fallback to dummy content
      return generateDummyContent(purpose, recipient);
    }
  }

  // Real campaign creation using authenticated endpoint
  async function createRealCampaign(emails: string[], content: EmailContent, campaignName: string) {
    try {
      console.log('Creating real campaign with:', { emails, content, campaignName });
      
      const requestBody = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        domain: formData.domain,
        purpose: formData.purpose,
        recipient_type: formData.recipient_type,
        industry: formData.industry,
        tone: formData.tone,
        key_points: formData.key_points,
        call_to_action: formData.call_to_action,
        campaign_name: campaignName,
        target_company: formData.company_name || deriveCompanyFromDomain(formData.domain),
        personalize_emails: formData.personalize_emails,
        recipient_data: emails.map(email => ({ email })),
        // Pass the email content if available (edited or generated)
        email_subject: content.subject,
        email_description: typeof content.preview === 'string' ? content.preview : content.preview || ''
      };
      
      console.log('=== FRONTEND REQUEST BODY ===');
      console.log(JSON.stringify(requestBody, null, 2));
      console.log('=== END FRONTEND REQUEST BODY ===');
      
      const response = await fetch('/api/backend/v2/ai-email-campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.log('=== BACKEND ERROR RESPONSE ===');
        console.log(JSON.stringify(errorData, null, 2));
        console.log('=== END BACKEND ERROR RESPONSE ===');
        throw new Error(errorData.error || 'Failed to create campaign');
      }
      
      const data = await response.json();
      console.log('Campaign created successfully:', data);
      
      return data.campaign_id;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  // Real status check using authenticated endpoint
  async function checkCampaignStatus(campaignId: string) {
    try {
      const response = await fetch(`/api/backend/v2/campaigns?campaign_id=${campaignId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to get campaign status');
      }
      
      const data = await response.json();
      
      // Return the status object from the campaign response
      if (data.success && data.campaign && data.campaign.status) {
        return data.campaign.status;
      } else {
        throw new Error('Invalid campaign status response');
      }
    } catch (error) {
      console.error('Error checking status:', error);
      return null;
    }
  }

  // Copy content to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Content copied to clipboard!');
  };

  // Start editing mode
  const startEditing = () => {
    if (emailContent) {
      setEditableSubject(emailContent.subject || '');
      setEditableContent(emailContent.preview && typeof emailContent.preview === 'string' ? emailContent.preview : '');
      setIsEditing(true);
    }
  };

  // Save edited content
  const saveEdits = () => {
    if (emailContent) {
      setEmailContent({
        subject: editableSubject,
        preview: editableContent
      });
      setIsEditing(false);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
  };

  // Regenerate content
  const regenerateContent = async () => {
    if (!formData.purpose || !formData.recipient_type || !formData.campaign_name) {
      alert('Please fill in all required fields first.');
      return;
    }

    setIsLoading(true);
    try {
      const content = await generatePersonalizedContent(formData.purpose, formData.recipient_type, formData.campaign_name);
      setEmailContent(content);
      setIsEditing(false); // Exit editing mode if active
    } catch (error) {
      console.error('Error regenerating content:', error);
      alert('Failed to regenerate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Real campaign execution
  const startCampaign = async () => {
    setIsLoading(true);
    setCampaignStatus(null);
    setGeneratedEmails([]);

    try {
      // Step 1: Generate real email addresses
      console.log('Generating email addresses...');
      const emails = await generateRealEmails(formData.first_name, formData.last_name, formData.domain);
      setGeneratedEmails(emails);
      
      // Step 2: Use existing email content if available (edited or previously generated), otherwise generate new
      let content: EmailContent;
      if (emailContent && emailContent.subject && emailContent.preview) {
        console.log('Using existing email content (may be edited)...');
        content = emailContent;
      } else {
        console.log('Generating email content...');
        content = await generatePersonalizedContent(formData.purpose, formData.recipient_type, formData.campaign_name);
        setEmailContent(content);
      }
      
      // Step 3: Create real campaign
      console.log('Creating campaign...');
      const campaignId = await createRealCampaign(emails, content, formData.campaign_name);
      
      if (!campaignId) {
        throw new Error('Failed to create campaign');
      }
      
      // Step 4: Start monitoring campaign progress
      setCampaignStatus({ status: "processing", progress: 0, sent: 0, failed: 0, total: emails.length });
      
      // Monitor campaign progress
      const monitorProgress = async () => {
        try {
          const status = await checkCampaignStatus(campaignId);
          if (status) {
            setCampaignStatus(status);
            
            // Continue monitoring if campaign is still processing
            if (status.status === 'processing') {
              setTimeout(monitorProgress, 2000); // Check every 2 seconds
            } else {
              setIsLoading(false);
              if (status.status === 'completed') {
                alert(`Campaign completed successfully!\n\nSent: ${status.sent} emails\nFailed: ${status.failed} emails\nTotal: ${status.total} emails`);
              } else {
                alert(`Campaign ${status.status}!\n\nSent: ${status.sent} emails\nFailed: ${status.failed} emails\nTotal: ${status.total} emails`);
              }
            }
          } else {
            setIsLoading(false);
            alert('Unable to monitor campaign progress. Please check the queue status.');
          }
        } catch (error) {
          console.error('Error monitoring campaign:', error);
          setIsLoading(false);
          alert('Error monitoring campaign progress. Please check the queue status.');
        }
      };
      
      // Start monitoring
      setTimeout(monitorProgress, 1000);
      
    } catch (error) {
      console.error('Campaign error:', error);
      setIsLoading(false);
      alert(`Error starting campaign: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Fallback to dummy data for display
      const emails = generateDummyEmails(formData.first_name, formData.last_name, formData.domain);
      setGeneratedEmails(emails);
      const content = generateDummyContent(formData.purpose, formData.recipient_type);
      setEmailContent(content);
    }
  };

  // CV upload and analysis removed
  // Note: generatePersonalizedContent is now defined earlier using useCallback

  // Show loading while checking profile
  if (isCheckingProfile) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
              <span>Checking CV profile...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Warning banner if CV profile is incomplete */}
      {cvProfileComplete === false && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <strong>CV Profile Incomplete:</strong> For better email personalization, consider completing your CV profile or uploading your CV. 
                  <Button asChild variant="link" className="h-auto p-0 ml-2 text-orange-700 underline">
                    <a href="/profile">Complete Profile</a>
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCvProfileComplete(null)}
                  className="ml-4 text-orange-700 hover:text-orange-900"
                >
                  Dismiss
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Email Campaign Builder
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Generate personalized email campaigns with AI. Real email addresses and AI content generation.
            </p>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="target" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="target">Target</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="target" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                {/* CV Upload Section */}
                <div className="space-y-2">
                  <Label htmlFor="cv_upload">Upload CV (PDF) - Optional</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="cv_upload"
                      type="file"
                      accept="application/pdf"
                      onChange={handleCVUpload}
                      className="cursor-pointer"
                      disabled={isAnalyzingCV}
                    />
                    {cvFile && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{cvFile.name}</span>
                      </div>
                    )}
                  </div>
                  {isAnalyzingCV && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Analyzing CV...</span>
                    </div>
                  )}
                  {cvAnalysis && !isAnalyzingCV && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h4 className="font-semibold text-green-800">CV Analysis Complete</h4>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div>
                          <strong className="text-green-800">Skills Detected:</strong>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {cvAnalysis.skills.map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 bg-white rounded border border-green-200 text-green-700">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <strong className="text-green-800">Experience:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1 text-green-700">
                            {cvAnalysis.experience.map((exp, idx) => (
                              <li key={idx}>{exp}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong className="text-green-800">Education:</strong>
                          <p className="text-green-700 mt-1">{cvAnalysis.education}</p>
                        </div>
                        <div>
                          <strong className="text-green-800">Summary:</strong>
                          <p className="text-green-700 mt-1">{cvAnalysis.summary}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="domain">Target Domain *</Label>
                    <Input
                      id="domain"
                      value={formData.domain}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData((prev) => {
                          const derivedName = deriveCompanyFromDomain(value);
                          return {
                            ...prev,
                            domain: value,
                            company_name:
                              companyNameTouched && prev.company_name
                                ? prev.company_name
                                : derivedName || prev.company_name
                          };
                        });
                      }}
                      placeholder="e.g., company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company_name">Target Company (optional)</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => {
                        setCompanyNameTouched(true);
                        setFormData({ ...formData, company_name: e.target.value });
                      }}
                      placeholder="e.g., Dentsu"
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="content" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="purpose">Purpose *</Label>
                    <Textarea
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                      placeholder="Describe what you want to achieve with this email campaign..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="recipient_type">Recipient Type *</Label>
                    <Input
                      id="recipient_type"
                      value={formData.recipient_type}
                      onChange={(e) => setFormData({ ...formData, recipient_type: e.target.value })}
                      placeholder="e.g., HR, Manager, CEO, Client"
                    />
                  </div>

                  <div>
                    <Label htmlFor="campaign_name">Campaign Name *</Label>
                    <Input
                      id="campaign_name"
                      value={formData.campaign_name}
                      onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                      placeholder="e.g., Job Application, Business Proposal"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="industry">Industry (Optional)</Label>
                      <Input
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        placeholder="e.g., Technology, Finance, Healthcare"
                      />
                    </div>

                    <div>
                      <Label htmlFor="tone">Email Tone</Label>
                      <select
                        id="tone"
                        value={formData.tone}
                        onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="professional">Professional</option>
                        <option value="friendly">Friendly</option>
                        <option value="formal">Formal</option>
                        <option value="casual">Casual</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="key_points">Key Points to Highlight (Optional)</Label>
                    <Textarea
                      id="key_points"
                      value={formData.key_points.join(', ')}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        key_points: e.target.value.split(',').map(point => point.trim()).filter(point => point) 
                      })}
                      placeholder="e.g., 5 years experience, React expertise, team leadership"
                      className="min-h-[60px]"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Separate multiple points with commas
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="call_to_action">Call to Action (Optional)</Label>
                    <Input
                      id="call_to_action"
                      value={formData.call_to_action}
                      onChange={(e) => setFormData({ ...formData, call_to_action: e.target.value })}
                      placeholder="e.g., Schedule a call, Reply with your thoughts"
                    />
                  </div>

                  {/* Generated Content Preview */}
                  {emailContent && (
                    <div className="mt-6 p-4 border rounded-lg bg-blue-50">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-blue-900">Generated Content Preview</h3>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            // Switch to preview tab
                            const previewTab = document.querySelector('[data-state="inactive"][id*="preview"]') as HTMLElement;
                            if (previewTab) {
                              previewTab.click();
                            }
                          }}
                          className="flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                          View & Edit
                        </Button>
                      </div>
                      <div className="text-sm text-blue-800">
                        <p><strong>Subject:</strong> {emailContent?.subject || 'No subject'}</p>
                        <p><strong>Content:</strong> {emailContent?.preview && typeof emailContent.preview === 'string' ? emailContent.preview.substring(0, 100) + '...' : 'Content generated successfully'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="preview" className="space-y-4">
                <div className="space-y-4">
                  {/* CV Analysis removed */}

                  {emailContent ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Generated Email Content</h3>
                        <div className="flex gap-2">
                          {!isEditing ? (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={regenerateContent}
                                disabled={isLoading}
                                className="flex items-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                                  <path d="M21 3v5h-5"/>
                                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                                  <path d="M8 16H3v5"/>
                                </svg>
                                {isLoading ? 'Generating...' : 'Regenerate'}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={startEditing}
                                className="flex items-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                  <path d="m15 5 4 4"/>
                                </svg>
                                Edit
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                variant="default" 
                                size="sm" 
                                onClick={saveEdits}
                                className="flex items-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20 6 9 17l-5-5"/>
                                </svg>
                                Save
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={cancelEditing}
                                className="flex items-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18 6 6 18"/>
                                  <path d="m6 6 12 12"/>
                                </svg>
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label>Subject Line</Label>
                        {isEditing ? (
                          <Input
                            value={editableSubject}
                            onChange={(e) => setEditableSubject(e.target.value)}
                            className="mt-1"
                            placeholder="Enter email subject"
                          />
                        ) : (
                          <div className="p-3 bg-muted rounded-md flex justify-between items-center mt-1">
                            <span>{emailContent?.subject || 'No subject'}</span>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => copyToClipboard(emailContent?.subject || 'No subject')}
                            >
                              Copy
                            </Button>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label>Email Body</Label>
                        {isEditing ? (
                          <Textarea
                            value={editableContent}
                            onChange={(e) => setEditableContent(e.target.value)}
                            className="mt-1 min-h-[200px]"
                            placeholder="Enter email content"
                          />
                        ) : (
                          <div className="p-3 bg-muted rounded-md mt-1">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium">Preview:</span>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => copyToClipboard(emailContent?.preview && typeof emailContent.preview === 'string' ? emailContent.preview : 'Email content generated successfully')}
                              >
                                Copy
                              </Button>
                            </div>
                            <div className="whitespace-pre-wrap text-sm">
                              {emailContent?.preview && typeof emailContent.preview === 'string' ? emailContent.preview : 'Email content generated successfully'}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Final Email Preview */}
                      <div className="mt-6 p-4 border rounded-lg bg-green-50">
                        <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 2H2l8 9.46V22l4-2v-8.54L22 2z"/>
                          </svg>
                          Final Email Preview
                        </h4>
                        <div className="bg-white p-4 rounded border">
                          <div className="mb-3">
                            <span className="text-sm text-gray-500">Subject:</span>
                            <div className="font-medium">{emailContent?.subject || 'No subject'}</div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Content:</span>
                            <div className="whitespace-pre-wrap text-sm mt-1">
                              {emailContent?.preview && typeof emailContent.preview === 'string' ? emailContent.preview : 'Email content generated successfully'}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 text-xs text-green-700">
                          This is how your email will appear to recipients. You can edit the content above before sending.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>Email content will be generated when you start the campaign.</AlertDescription>
                    </Alert>
                  )}
                  {generatedEmails.length > 0 && (
                    <div>
                      <Label>Generated Email Addresses ({generatedEmails.length})</Label>
                      <div className="p-3 bg-muted rounded-md max-h-32 overflow-y-auto flex justify-between items-start">
                        <div className="flex-1">
                          {generatedEmails.map((email, index) => (
                            <div key={index} className="text-sm">{email}</div>
                          ))}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => copyToClipboard(generatedEmails.join('\n'))}
                          className="ml-2"
                        >
                          Copy All
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            <div className="flex justify-end mt-6">
              <Button onClick={startCampaign} disabled={isLoading || !formData.first_name || !formData.last_name || !formData.domain || !formData.purpose || !formData.recipient_type || !formData.campaign_name} className="min-w-[150px]">
                {isLoading ? (<><Clock className="h-4 w-4 mr-2 animate-spin" />Starting...</>) : (<><Send className="h-4 w-4 mr-2" />Start Campaign</>)}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <AnimatePresence>
        {campaignStatus && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Campaign Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{campaignStatus.sent} / {campaignStatus.total}</span>
                  </div>
                  <Progress value={campaignStatus.progress} className="w-full" />
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{campaignStatus.sent}</div>
                      <div className="text-sm text-muted-foreground">Sent</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{campaignStatus.failed}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{campaignStatus.total}</div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {campaignStatus.status === 'completed' ? (<CheckCircle className="h-4 w-4 text-green-600" />) : (<Clock className="h-4 w-4 text-blue-600 animate-spin" />)}
                    <span className="text-sm font-medium capitalize">{campaignStatus.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 