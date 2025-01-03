import { Card, CardContent } from "@/components/ui/card";
import { 
  Zap, 
  Target, 
  BarChart, 
  Users, 
  Mail, 
  Bot,
  Sparkles,
  Clock
} from "lucide-react";

const features = [
  {
    icon: <Bot className="h-8 w-8" />,
    title: "AI-Powered Writing",
    description: "Let AI craft perfect email copy that resonates with your audience.",
  },
  {
    icon: <Target className="h-8 w-8" />,
    title: "Smart Segmentation",
    description: "Automatically segment your audience based on behavior and preferences.",
  },
  {
    icon: <BarChart className="h-8 w-8" />,
    title: "Advanced Analytics",
    description: "Get deep insights into campaign performance and subscriber engagement.",
  },
  {
    icon: <Clock className="h-8 w-8" />,
    title: "Automated Scheduling",
    description: "Send emails at the perfect time for maximum engagement.",
  },
  {
    icon: <Sparkles className="h-8 w-8" />,
    title: "Dynamic Content",
    description: "Personalize content for each recipient automatically.",
  },
  {
    icon: <Mail className="h-8 w-8" />,
    title: "Template Library",
    description: "Access hundreds of professional email templates.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Everything You Need for Email Success
          </h2>
          <p className="text-muted-foreground text-lg">
            Powerful features to help you create, send, and optimize your email campaigns
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => (
            <Card key={feature.title} className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="rounded-lg w-12 h-12 flex items-center justify-center bg-primary/10 text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}