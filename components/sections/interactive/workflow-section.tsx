"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  PenTool,
  Sparkles,
  Send,
  BarChart
} from "lucide-react";

const steps = [
  {
    icon: <PenTool className="w-6 h-6" />,
    title: "Create",
    description: "Write your email content or use AI to generate it"
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Enhance",
    description: "Let AI optimize your content for better engagement"
  },
  {
    icon: <Send className="w-6 h-6" />,
    title: "Send",
    description: "Schedule and send to your targeted audience"
  },
  {
    icon: <BarChart className="w-6 h-6" />,
    title: "Analyze",
    description: "Track performance and improve future campaigns"
  }
];

export function WorkflowSection() {
  return (
    <div className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground">
            Simple steps to email marketing success
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full relative group">
                <motion.div
                  className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"
                  layoutId="highlight"
                />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}