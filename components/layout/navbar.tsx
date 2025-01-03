"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { Mail, Moon, Sun } from "lucide-react";

interface NavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export function Navbar({ isDarkMode, toggleTheme }: NavbarProps) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">EmailAI</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#home" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </a>
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">
              Testimonials
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button onClick={() => setIsAuthOpen(true)}>Sign In</Button>
          </div>
        </div>
      </nav>
      <AuthDialog isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}