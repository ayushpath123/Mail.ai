"use client";

import { useState } from "react";
import { UserForm } from "@/components/email-lab/user-form";
import { AISuggestions } from "@/components/email-lab/ai-suggestions";
import { EmailEditor } from "@/components/email-lab/email-editor";
import { motion } from "framer-motion";
import { AIMailForm } from "@/components/email-lab/prompt";

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
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">Email Lab</h2>
          <p className="text-muted-foreground text-lg">
            Create perfect emails with AI-powered suggestions
          </p>
        </motion.div>

        {/* Form Section */}
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
      </div>
    </section>
  );
}
