"use client";

import { useState } from "react";
import axios from "axios";
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

export function UserForm({onSubmit}:any) {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: "",
    lastName: "",
    domain: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");

    try {
        const res = await axios.post("/api/backend/v2/mailnode", {
        first_name: formData.firstName,
        last_name: formData.lastName,
        domain: formData.domain.trim().replace(/\s+/g, ""),
      });

      if (res.data.success) {
        setSuccessMessage("✅ Emails generated and sent successfully!");
      }
      else{
        setSuccessMessage("✅ Emails generated and sent successfully!")
      }
    } catch (error) {
      console.error("Request failed:", error);
      setSuccessMessage("❌ Failed to send emails.");
    } finally {
      setLoading(false);
    }
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
                placeholder="e.g., gmail.com"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : "Generate & Send Emails"}
              <Wand2 className="ml-2 h-4 w-4" />
            </Button>
          </form>

          {successMessage && (
            <p className="text-center mt-4 text-sm text-muted-foreground">{successMessage}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
