import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, FileText, MessageSquare, BookOpen } from "lucide-react";

const integrationCode = `import { EmailAI } from '@email-ai/sdk';

const client = new EmailAI({
  apiKey: 'your-api-key'
});

// Create a new campaign
const campaign = await client.createCampaign({
  name: 'Welcome Series',
  template: 'welcome-email',
  audience: 'new-subscribers'
});`;

const documentationSections = [
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Quick Start Guide",
    content: "Get up and running with EmailAI in minutes. Follow our step-by-step guide to send your first AI-powered email campaign.",
  },
  {
    icon: <Code className="h-6 w-6" />,
    title: "API Reference",
    content: "Comprehensive API documentation with examples for all endpoints. Integrate EmailAI into your existing workflow.",
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    title: "Best Practices",
    content: "Learn how to maximize your email marketing success with our proven strategies and tips.",
  },
];

export function DocumentationSection() {
  return (
    <section id="docs" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Documentation & Resources</h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to get started with EmailAI
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {documentationSections.map((section) => (
            <Card key={section.title}>
              <CardContent className="pt-6">
                <div className="rounded-lg w-12 h-12 flex items-center justify-center bg-primary/10 text-primary mb-4">
                  {section.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                <p className="text-muted-foreground">{section.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Integration Example</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="nodejs" className="w-full">
              <TabsList>
                <TabsTrigger value="nodejs">Node.js</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="php">PHP</TabsTrigger>
              </TabsList>
              <TabsContent value="nodejs">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">{integrationCode}</code>
                </pre>
              </TabsContent>
              <TabsContent value="python">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">
                    {`from email_ai import EmailAI

client = EmailAI(api_key='your-api-key')

# Create a new campaign
campaign = client.create_campaign(
    name='Welcome Series',
    template='welcome-email',
    audience='new-subscribers'
)`}
                  </code>
                </pre>
              </TabsContent>
              <TabsContent value="php">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">
                    {`<?php
require_once('vendor/autoload.php');

$client = new EmailAI\\Client([
    'api_key' => 'your-api-key'
]);

// Create a new campaign
$campaign = $client->campaigns->create([
    'name' => 'Welcome Series',
    'template' => 'welcome-email',
    'audience' => 'new-subscribers'
]);`}
                  </code>
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}