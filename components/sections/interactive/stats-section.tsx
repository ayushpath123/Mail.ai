"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { 
  Users,
  Mail,
  Target,
  TrendingUp
} from "lucide-react";

const stats = [
  {
    icon: <Users className="w-8 h-8" />,
    value: "50,000+",
    label: "Active Users",
    color: "bg-blue-500"
  },
  {
    icon: <Mail className="w-8 h-8" />,
    value: "1M+",
    label: "Emails Sent",
    color: "bg-green-500"
  },
  {
    icon: <Target className="w-8 h-8" />,
    value: "98%",
    label: "Delivery Rate",
    color: "bg-purple-500"
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    value: "45%",
    label: "Avg. Open Rate",
    color: "bg-orange-500"
  }
];

export function StatsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  return (
    <div ref={containerRef} className="py-24 bg-gradient-to-b from-muted/50 to-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 text-center relative overflow-hidden group">
                <motion.div
                  className={`absolute inset-0 opacity-10 ${stat.color}`}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
                <motion.div
                  className="relative z-10"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="mb-4 flex justify-center">{stat.icon}</div>
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}