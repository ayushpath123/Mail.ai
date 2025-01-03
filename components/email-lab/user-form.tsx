"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Wand2 } from "lucide-react";

interface UserFormData {
  firstName: string;
  lastName: string;
  domain: string;
}

interface UserFormProps {
  onSubmit: (data: UserFormData) => void;
}

export function UserForm({ onSubmit }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    domain: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Tell us about your business</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Business Domain</Label>
              <Input
                id="domain"
                placeholder="e.g., ecommerce, tech, healthcare"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full">
              Generate Email Ideas <Wand2 className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}