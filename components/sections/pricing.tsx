import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

const plans = [
  {
    title: "Starter",
    price: "Free",
    features: [
      "1,000 emails/month",
      "Basic AI templates",
      "Email support",
      "Basic analytics",
      "1 team member",
    ],
  },
  {
    title: "Pro",
    price: "$49",
    period: "/month",
    features: [
      "50,000 emails/month",
      "Advanced AI features",
      "Custom templates",
      "Priority support",
      "Advanced analytics",
      "Up to 5 team members",
      "A/B testing",
      "Custom branding",
    ],
    popular: true,
  },
  {
    title: "Enterprise",
    price: "Custom",
    features: [
      "Unlimited emails",
      "Custom AI training",
      "Dedicated account manager",
      "24/7 phone support",
      "Advanced security",
      "Custom integrations",
      "SLA guarantee",
      "Unlimited team members",
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground text-lg">
            Choose the perfect plan for your business needs
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.title} 
              className={`relative ${
                plan.popular ? "border-primary shadow-lg scale-105" : ""
              }`}
            >
              {plan.popular && (
                <Badge className="absolute top-4 right-4">Most Popular</Badge>
              )}
              <CardHeader>
                <CardTitle>{plan.title}</CardTitle>
                <div className="flex items-baseline mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}