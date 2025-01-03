"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { TemplateCard } from "./template-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const templates = {
  welcome: [
    {
      id: "welcome-1",
      title: "Modern Welcome",
      description: "A clean, modern welcome email with personalization",
      preview: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=500&q=80",
    },
    {
      id: "welcome-2",
      title: "Warm Welcome",
      description: "Friendly and engaging welcome message",
      preview: "https://images.unsplash.com/photo-1565932887479-b18108f07ffd?w=500&q=80",
    },
  ],
  promotional: [
    {
      id: "promo-1",
      title: "Flash Sale",
      description: "Urgent promotional email with countdown timer",
      preview: "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=500&q=80",
    },
    {
      id: "promo-2",
      title: "Seasonal Sale",
      description: "Holiday-themed promotional campaign",
      preview: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500&q=80",
    },
  ],
  newsletter: [
    {
      id: "news-1",
      title: "Monthly Digest",
      description: "Clean and organized monthly newsletter",
      preview: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=500&q=80",
    },
    {
      id: "news-2",
      title: "Weekly Update",
      description: "Engaging weekly news summary",
      preview: "https://images.unsplash.com/photo-1594732832278-abd644401426?w=500&q=80",
    },
  ],
};

export function TemplateSection() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">
            Ready-to-Use Email Templates
          </h2>
          <p className="text-muted-foreground text-lg">
            Choose from our professionally designed templates and customize them to match your brand
          </p>
        </motion.div>

        <Tabs defaultValue="welcome" className="w-full max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="welcome">Welcome Emails</TabsTrigger>
            <TabsTrigger value="promotional">Promotional</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletters</TabsTrigger>
          </TabsList>
          {Object.entries(templates).map(([category, categoryTemplates]) => (
            <TabsContent key={category} value={category}>
              <div className="grid md:grid-cols-2 gap-6">
                {categoryTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate === template.id}
                    onSelect={setSelectedTemplate}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}