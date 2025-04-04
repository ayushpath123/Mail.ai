import { useState } from "react";
import axios from "axios";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";

export function AIMailForm({onSubmit}:any) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedMail, setGeneratedMail] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedMail("");

    try {
        setLoading(true); // Optional: make sure loading state is activated
      
        // Simulate a 2-second delay
        await new Promise((resolve) => setTimeout(resolve, 2000));
      
        // Simulate successful generation
        setGeneratedMail("✅ Your AI-generated email goes here.");
      } catch (err) {
        console.error("Simulation failed:", err);
        setGeneratedMail("❌ Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }      

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl">AI Email Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Enter prompt</Label>
            <Textarea
              id="prompt"
              placeholder="e.g., Invite client for a product demo"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Generating..." : "Generate Email"}
            <Sparkles className="ml-2 h-4 w-4" />
          </Button>
        </form>

        {generatedMail && (
          <div className="mt-6 p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
            {generatedMail}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
