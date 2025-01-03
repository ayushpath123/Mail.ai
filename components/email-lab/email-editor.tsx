"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Sparkles, Copy } from "lucide-react";

interface EmailEditorProps {
  initialContent?: string;
}

export function EmailEditor({ initialContent = "" }: EmailEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    // Simulated AI response
    setTimeout(() => {
      setContent(`Dear [Customer],

We're thrilled to introduce our latest collection of premium products designed specifically for tech enthusiasts like you. 

Our team has carefully curated this selection based on the latest industry trends and customer feedback.

🌟 Highlights of our new collection:
- Advanced smart home devices
- Premium accessories
- Exclusive limited editions

Shop now and get 20% off your first purchase!

Best regards,
[Your Name]`);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Email Editor</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigator.clipboard.writeText(content)}>
                <Copy className="h-4 w-4 mr-2" /> Copy
              </Button>
              <Button variant="outline" onClick={handleAIGenerate} disabled={isGenerating}>
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "AI Suggestions"}
              </Button>
              <Button>
                <Send className="h-4 w-4 mr-2" /> Send Email
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="edit">
            <TabsList className="mb-4">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="edit">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] font-mono"
                placeholder="Write your email content here..."
              />
            </TabsContent>
            <TabsContent value="preview">
              <div className="prose max-w-none p-4 bg-card rounded-lg min-h-[400px]">
                {content.split('\n').map((line, i) => (
                  <p key={i} className="mb-4">{line}</p>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}