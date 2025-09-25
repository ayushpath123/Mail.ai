"use client";

import { useState } from "react";
import { UserForm } from "@/components/email-lab/user-form";
import { AISuggestions } from "@/components/email-lab/ai-suggestions";
import { EmailEditor } from "@/components/email-lab/email-editor";
import { AICampaignBuilder } from "@/components/email-lab/ai-campaign-builder";
import { motion } from "framer-motion";
import { AIMailForm } from "@/components/email-lab/prompt";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Users, Mail, Zap } from "lucide-react";

type Step = "form" | "suggestions" | "editor";

export function EmailLabSection() {
  const [step, setStep] = useState<Step>("form");
  const [userData, setUserData] = useState(null);

  const handleFormSubmit = (data: any) => {
    setUserData(data);
    setStep("suggestions");
  };

  const handleFormSubmit2 = (data: any) => {
    // handle prompt submission (optional: navigate to suggestions or editor)
    console.log("AI Prompt submitted:", data);
  };

  const handleSuggestionSelect = (suggestion: any) => {
    setStep("editor");
  };

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Email Lab</h2>
          <p className="text-muted-foreground text-lg">
            Create perfect emails with AI-powered suggestions and automated campaigns
          </p>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="campaign" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="campaign" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Campaign Builder
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Editor
            </TabsTrigger>
            <TabsTrigger value="legacy" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Legacy Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaign" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    AI-Powered Email Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-muted rounded-lg">
                      <Sparkles className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <h3 className="font-semibold mb-1">AI Content Generation</h3>
                      <p className="text-sm text-muted-foreground">
                        Generate personalized email content based on your requirements
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <h3 className="font-semibold mb-1">Smart Email Discovery</h3>
                      <p className="text-sm text-muted-foreground">
                        Automatically find and generate professional email addresses
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <Mail className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <h3 className="font-semibold mb-1">Queue-Based Sending</h3>
                      <p className="text-sm text-muted-foreground">
                        Handle bulk emails efficiently with our robust queue system
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <AICampaignBuilder />
            </motion.div>
          </TabsContent>

          <TabsContent value="editor" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <EmailEditor />
            </motion.div>
          </TabsContent>

          <TabsContent value="legacy" className="space-y-8">
            {/* Legacy Form Section */}
            <div className="space-y-8">
              {step === "form" && (
                <div className="flex flex-row justify-center gap-8 items-start flex-wrap">
                  {/* UserForm with animation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                  >
                    <UserForm onSubmit={handleFormSubmit} />
                  </motion.div>

                  {/* AIMailForm with animation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="w-full max-w-md"
                  >
                    <AIMailForm onSubmit={handleFormSubmit2} />
                  </motion.div>
                </div>
              )}

              {/* AI Suggestions */}
              {step === "suggestions" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <AISuggestions onSelect={handleSuggestionSelect} />
                </motion.div>
              )}

              {/* Email Editor */}
              {step === "editor" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <EmailEditor />
                </motion.div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
