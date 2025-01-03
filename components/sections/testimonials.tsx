import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechCorp",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    quote: "EmailAI has transformed our email marketing strategy. The AI-powered suggestions are spot-on and have increased our open rates by 45%!",
  },
  {
    name: "Michael Chen",
    role: "CEO",
    company: "GrowthLabs",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    quote: "The automation features have saved us countless hours. Our engagement rates have never been better, and the ROI speaks for itself.",
  },
  {
    name: "Emma Williams",
    role: "Email Specialist",
    company: "E-commerce Pro",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    quote: "The best email marketing tool I've ever used. The AI suggestions are incredibly accurate, and the template library is extensive.",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Loved by Businesses Worldwide</h2>
          <p className="text-muted-foreground text-lg">
            See what our customers have to say about EmailAI
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="relative">
              <CardContent className="pt-12">
                <Quote className="absolute top-6 left-6 h-8 w-8 text-primary/20" />
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-20 h-20 rounded-full mx-auto mb-6 object-cover"
                />
                <p className="text-muted-foreground mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="text-center">
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}