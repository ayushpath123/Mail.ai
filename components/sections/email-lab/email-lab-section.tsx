"use client";

import { useState } from "react";
import { UserForm } from "@/components/email-lab/user-form";
import { AISuggestions } from "@/components/email-lab/ai-suggestions";
import { EmailEditor } from "@/components/email-lab/email-editor";
import { motion } from "framer-motion";

type Step = "form" | "suggestions" | "editor";

export function EmailLabSection() {
  const [step, setStep] = useState<Step>("form");
  const [userData, setUserData] = useState(null);

  const handleFormSubmit = (data: any) => {
    setUserData(data);
    setStep("suggestions");
  };

  const handleSuggestionSelect = (suggestion: any) => {
    setStep("editor");
  };

  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="container mx-auto px-4">
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

        <div className="space-y-8">
          {step === "form" && <UserForm onSubmit={handleFormSubmit} />}
          {step === "suggestions" && <AISuggestions onSelect={handleSuggestionSelect} />}
          {step === "editor" && <EmailEditor />}
        </div>
      </div>
    </section>
  );
}