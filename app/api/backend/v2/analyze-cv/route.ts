import { NextRequest, NextResponse } from 'next/server';
import { Groqfns } from '@/actions/prompt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cv_content, purpose, recipient_type } = body;

    if (!cv_content) {
      return NextResponse.json({ error: 'CV content is required' }, { status: 400 });
    }

    // Create a prompt for CV analysis
    const analysisPrompt = `Analyze the following CV content and provide insights for creating a personalized email:

CV Content:
${cv_content.substring(0, 1000)}

Purpose: ${purpose}
Recipient Type: ${recipient_type}

Please provide:
1. Key skills and experiences to highlight
2. Relevant achievements that match the purpose
3. Professional tone suggestions
4. Specific talking points for the email

Format the response as a structured analysis.`;

    // Use the existing prompt function to analyze CV
    const analysis = await Groqfns({
      first_name: "CV",
      last_name: "Analysis",
      domain: "analysis.com",
      custom_prompt: analysisPrompt
    });

    return NextResponse.json({
      success: true,
      analysis: analysis,
      cv_summary: cv_content.substring(0, 200) + "...",
      suggestions: {
        skills_to_highlight: ["Based on CV analysis"],
        achievements_to_mention: ["Relevant experience"],
        tone: "Professional and confident",
        key_points: ["Customized based on CV"]
      }
    });

  } catch (error) {
    console.error('CV Analysis Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze CV' },
      { status: 500 }
    );
  }
} 