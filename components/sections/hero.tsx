"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section id="home" className="pt-32 pb-16 min-h-screen flex items-center">
      <div className="container mx-auto px-4 text-center">
        <Badge className="mb-4">✨ AI-Powered Email Marketing</Badge>
        <h1 className="text-4xl md:text-7xl font-bold mb-6 tracking-tight">
          Automate Your Emails,{" "}
          <span className="bg-gradient-to-r from-primary to-primary/50 text-transparent bg-clip-text">
            Amplify Your Reach
          </span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Harness the power of AI to create personalized email campaigns that
          convert. Save time, increase engagement, and grow your business.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
          <Button size="lg" className="w-full sm:w-auto group" asChild>
            <Link href="/dashboard">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
            <Link href="https://www.youtube.com/watch?v=ZfEK3WP73eY" target="_blank" rel="noopener noreferrer">
              Watch Demo
            </Link>
          </Button>
        </div>
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto text-center">
          {[
            { label: "Active Users", value: "10,000+" },
            { label: "Emails Sent", value: "1M+" },
            { label: "Open Rate", value: "35%" },
            { label: "ROI Average", value: "300%" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold mb-2">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}