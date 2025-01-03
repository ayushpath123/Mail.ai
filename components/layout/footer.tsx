import { Button } from "@/components/ui/button";
import { Mail, Twitter, Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Mail className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">EmailAI</span>
            </div>
            <p className="text-muted-foreground">
              AI-powered email marketing for modern businesses
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-muted-foreground hover:text-primary">Features</a></li>
              <li><a href="#pricing" className="text-muted-foreground hover:text-primary">Pricing</a></li>
              <li><a href="#docs" className="text-muted-foreground hover:text-primary">Documentation</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#about" className="text-muted-foreground hover:text-primary">About</a></li>
              <li><a href="#blog" className="text-muted-foreground hover:text-primary">Blog</a></li>
              <li><a href="#careers" className="text-muted-foreground hover:text-primary">Careers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#privacy" className="text-muted-foreground hover:text-primary">Privacy</a></li>
              <li><a href="#terms" className="text-muted-foreground hover:text-primary">Terms</a></li>
              <li><a href="#security" className="text-muted-foreground hover:text-primary">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t">
          <div className="text-sm text-muted-foreground mb-4 md:mb-0">
            © 2024 EmailAI. All rights reserved.
          </div>
          <div className="flex space-x-4">
            <Button variant="ghost" size="icon">
              <Twitter className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Github className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Linkedin className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}