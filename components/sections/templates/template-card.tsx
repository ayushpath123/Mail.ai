"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface TemplateCardProps {
  template: {
    id: string;
    title: string;
    description: string;
    preview: string;
  };
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`relative overflow-hidden ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-0">
          <img 
            src={template.preview} 
            alt={template.title}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">{template.title}</h3>
            <p className="text-muted-foreground text-sm">{template.description}</p>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button 
            variant={isSelected ? "default" : "outline"} 
            className="w-full"
            onClick={() => onSelect(template.id)}
          >
            {isSelected ? (
              <span className="flex items-center gap-2">
                <Check className="h-4 w-4" /> Selected
              </span>
            ) : "Use Template"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}