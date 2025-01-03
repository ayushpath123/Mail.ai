"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { 
  Zap, 
  Mail, 
  BarChart3,
  Users,
  Bot,
  Sparkles
} from "lucide-react";

const features = [
  {
    icon: <Bot />,
    title: "AI Writing Assistant",
    description: "Generate engaging email content in seconds",
    video: "https://assets.mixkit.co/videos/preview/mixkit-typing-on-smartphone-in-the-dark-4083-large.mp4"
  },
  {
    icon: <BarChart3 />,
    title: "Analytics Dashboard",
    description: "Track performance metrics in real-time",
    video: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-4779-large.mp4"
  },
  {
    icon: <Users />,
    title: "Audience Segmentation",
    description: "Target the right audience with precision",
    video: "https://assets.mixkit.co/videos/preview/mixkit-woman-typing-on-a-laptop-4814-large.mp4"
  }
];

export function FeatureShowcase() {
  return (
    <div className="py-24 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Experience the Power of AI</h2>
          <p className="text-xl text-muted-foreground">Watch our features in action</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="overflow-hidden">
                <div className="relative h-64">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  >
                    <source src={feature.video} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="text-white w-16 h-16"
                    >
                      {feature.icon}
                    </motion.div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}