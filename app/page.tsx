"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/sections/hero";
import { FeaturesSection } from "@/components/sections/features";
import { FeatureShowcase } from "@/components/sections/features/feature-showcase";
import { StatsSection } from "@/components/sections/interactive/stats-section";
import { WorkflowSection } from "@/components/sections/interactive/workflow-section";
import { TemplateSection } from "@/components/sections/templates/template-section";
import { PricingSection } from "@/components/sections/pricing";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { DocumentationSection } from "@/components/sections/documentation";
import { Footer } from "@/components/layout/footer";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className={`min-h-screen bg-background ${isDarkMode ? "dark" : ""}`}>
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <FeatureShowcase />
        <WorkflowSection />
        <TemplateSection />
        <PricingSection />
        <TestimonialsSection />
        <DocumentationSection />
      </main>
      <Footer />
    </div>
  );
}