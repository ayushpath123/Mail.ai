"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, Zap } from "lucide-react";

const suggestions = [
  {
    title: "Welcome Series",
    description: "A 3-part email series to introduce new customers to your brand",
    tone: "Friendly",
    estimatedResponse: "+45% engagement",
  },
  {
    title: "Product Launch",
    description: "Announce your latest products with compelling copy",
    tone: "Professional",
    estimatedResponse: "+30% clicks",
  },
  {
    title: "Customer Feedback",
    description: "Request feedback while maintaining a personal connection",
    tone: "Conversational",
    estimatedResponse: "+25% responses",
  },
];

interface AISuggestionsProps {
  onSelect: (suggestion: any) => void;
}

export function AISuggestions({ onSelect }: AISuggestionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            AI-Generated Email Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {suggestions.map((suggestion) => (
              <motion.div
                key={suggestion.title}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="h-full">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold mb-2">{suggestion.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {suggestion.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Tone: {suggestion.tone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{suggestion.estimatedResponse}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => onSelect(suggestion)}
                    >
                      Use This Template
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}