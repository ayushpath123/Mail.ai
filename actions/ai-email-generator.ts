type GenerateEmailArgs = {
  purpose: string;
  recipient_type: string;
  industry?: string;
  tone?: string;
  key_points?: string[];
  call_to_action?: string;
  sender_name?: string;
  sender_company?: string;
  target_domain?: string;
  target_company?: string;
  cv_profile?: any;
  cv_raw_text?: string | null;
};

function cleanText(value?: string | null, limit = 900) {
  if (!value) return "";
  const compacted = value.replace(/\s+/g, " ").trim();
  return compacted.length > limit ? `${compacted.slice(0, limit)}...` : compacted;
}

function toTitleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function extractCompanyName(domain?: string | null) {
  if (!domain) return null;
  const cleaned = domain
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .replace(/\s+/g, "");

  if (!cleaned) return null;

  const multiPartSuffixes = ["co.uk", "co.in", "com.au", "com.br", "com.sg"];
  const parts = cleaned.split(".").filter(Boolean);
  if (parts.length === 0) return null;

  const lastTwo = parts.slice(-2).join(".");
  if (multiPartSuffixes.includes(lastTwo) && parts.length >= 3) {
    return toTitleCase(parts[parts.length - 3]);
  }

  if (parts.length === 1) {
    return toTitleCase(parts[0]);
  }

  return toTitleCase(parts[parts.length - 2]);
}

function buildCvContext(profile?: any, rawText?: string | null) {
  let context = "";

  if (profile && typeof profile === "object" && !Array.isArray(profile)) {
    if (profile.summary) {
      context += `\nProfessional Summary: ${cleanText(profile.summary, 600)}`;
    }

    if (Array.isArray(profile.experience) && profile.experience.length > 0) {
      const experiences = profile.experience.slice(0, 3).map((exp: any) => {
        const achievements = Array.isArray(exp.achievements) && exp.achievements.length > 0
          ? ` | Achievements: ${exp.achievements.slice(0, 2).map((item: string) => cleanText(item, 160)).join("; ")}`
          : exp.description
          ? ` | Highlights: ${cleanText(exp.description, 180)}`
          : "";
        return `${exp.position} at ${exp.company} (${exp.duration})${achievements}`;
      });
      context += `\nRecent Experience: ${experiences.join(" • ")}`;
    }

    if (Array.isArray(profile.projects) && profile.projects.length > 0) {
      const project = profile.projects[0];
      const tech = Array.isArray(project.technologies) && project.technologies.length > 0
        ? ` | Tech: ${project.technologies.slice(0, 4).join(", ")}`
        : "";
      context += `\nHighlighted Project: ${project.name}${project.description ? ` - ${cleanText(project.description, 200)}` : ""}${tech}`;
    }

    if (Array.isArray(profile.education) && profile.education.length > 0) {
      const education = profile.education[0];
      context += `\nEducation: ${education.degree} in ${education.field} from ${education.institution}`;
    }

    if (Array.isArray(profile.technicalSkills) && profile.technicalSkills.length > 0) {
      context += `\nKey Skills: ${profile.technicalSkills.slice(0, 8).join(", ")}`;
    }
  }

  if (!context && rawText) {
    const lines = rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const bulletHighlights = lines
      .filter((line) => /^[-*•]/.test(line))
      .map((line) => line.replace(/^[-*•]\s*/, ""))
      .slice(0, 8)
      .map((line) => cleanText(line, 150));

    if (bulletHighlights.length > 0) {
      context += `\nResume Highlights: ${bulletHighlights.join(" • ")}`;
    } else {
      context += `\nResume Summary: ${cleanText(rawText, 750)}`;
    }
  }

  return context;
}

export async function generateEmailContent({
  purpose,
  recipient_type,
  industry,
  tone,
  key_points,
  call_to_action,
  sender_name,
  sender_company,
  target_domain,
  target_company,
  cv_profile,
  cv_raw_text,
}: GenerateEmailArgs) {
  // TEMPORARILY: Skip AI generation and use fallback directly
  console.log('=== USING FALLBACK EMAIL TEMPLATE (AI DISABLED) ===');
  const derivedCompany = target_company?.trim() || extractCompanyName(target_domain) || 'your company';
  console.log('Target company:', derivedCompany);
  console.log('Recipient type:', recipient_type);
  
  const fallback = generateFallbackContent(purpose, recipient_type, sender_name, call_to_action, derivedCompany);
  console.log('Fallback email generated with subject:', fallback.subject);
  return fallback;

  /* AI GENERATION CODE - DISABLED TEMPORARILY
  try {
    console.log('=== STARTING EMAIL GENERATION ===');
    console.log('Target company:', target_company);
    console.log('Target domain:', target_domain);
    console.log('CV profile provided:', !!cv_profile);
    console.log('CV raw text provided:', !!cv_raw_text);
    console.log('CV profile type:', typeof cv_profile);
    if (cv_profile) {
      console.log('CV profile keys:', Object.keys(cv_profile));
    }

    const derivedCompany = target_company?.trim() || extractCompanyName(target_domain) || 'the company';
    console.log('Derived company name:', derivedCompany);

    const cvContext = buildCvContext(cv_profile, cv_raw_text);
    console.log('CV context built, length:', cvContext.length);
    if (cvContext) {
      console.log('CV context preview:', cvContext.substring(0, 200));
    }

    // Build a comprehensive prompt for AI generation
    const keyPointsText = key_points && key_points.length > 0 
      ? `\nAdditional Key Points: ${key_points.join(', ')}`
      : '';
    
    const industryText = industry ? `\nIndustry Focus: ${industry}` : '';
    
    // Build a more explicit prompt
    const cvInfo = cvContext 
      ? `\n\nSENDER'S BACKGROUND (from CV):${cvContext}\n\nUse this information to make the email highly personalized and relevant.`
      : '\n\nNOTE: CV information is not available. Still create a personalized email based on the purpose and target company.';
    
    const prompt = `You are creating a unique, personalized outreach email tailored specifically to ${derivedCompany} using the sender's background.

CRITICAL: You MUST return ONLY valid JSON (no markdown, no code blocks, no explanations) with this exact schema:
{
  "subject": "string - <=60 characters that mentions ${derivedCompany}",
  "body": "string - personalized multi-line professional email body"
}

TARGET COMPANY: ${derivedCompany}${target_domain ? ` (${target_domain})` : ''}
PURPOSE: ${purpose}
RECIPIENT: ${recipient_type} at ${derivedCompany}
EMAIL TONE: ${tone || 'professional'}
SENDER NAME: ${cv_profile?.fullName || sender_name || 'Professional'}
SENDER COMPANY: ${sender_company || 'Independent professional'}${cvInfo}${industryText}${keyPointsText}
CALL TO ACTION: ${call_to_action || 'I would appreciate the opportunity to discuss this further'}

STRICT REQUIREMENTS:
1. The email MUST be uniquely tailored to ${derivedCompany} - mention the company name naturally in the body.
2. If CV details are provided, reference specific experiences, skills, or achievements that relate to ${derivedCompany}.
3. Explain WHY the sender is interested in ${derivedCompany} specifically (not generic reasons).
4. Keep the body concise: 2-3 short paragraphs plus a professional closing.
5. NEVER use generic templates like "I hope this email finds you well" or "I believe this could be a great opportunity" - be specific and personal.
6. The subject line must reference ${derivedCompany} and be compelling.
7. Escape any quotes in the JSON properly (use \\" for internal quotes).
8. Use \\n for line breaks in the body string.

Return ONLY the JSON object, nothing else.`;

    console.log('AI Prompt:', prompt.substring(0, 500) + '...');
    console.log('Full prompt length:', prompt.length);

    // Check if Groq API key is available
    if (!process.env.GROQ_API_KEY) {
      console.error('=== GROQ_API_KEY NOT FOUND IN ENVIRONMENT ===');
      throw new Error('GROQ_API_KEY environment variable is not set');
    }

    console.log('Groq API key found, making API call...');

    // Use the Groq API for content generation
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are an expert email marketing copywriter. Generate professional, personalized email content that converts. Always return valid JSON in the exact format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    console.log('Groq API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('=== GROQ API ERROR ===');
      console.error('Status:', response.status);
      console.error('Error body:', errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0]?.message?.content || '';
    
    console.log('=== GROQ API RESPONSE ===');
    console.log('Raw content length:', generatedContent.length);
    console.log('Full response:', generatedContent);
    console.log('CV Context available:', cvContext ? 'Yes' : 'No');
    console.log('CV Context length:', cvContext.length);
    console.log('=== END GROQ RESPONSE ===');

    let parsedSubject: string | undefined;
    let parsedBody: string | undefined;

    // Since we're using response_format: { type: 'json_object' }, the response should be valid JSON
    // But handle both cases: direct JSON or JSON wrapped in markdown
    
    let jsonCandidate = generatedContent.trim();
    
    // Remove markdown code blocks if present
    const codeBlockMatch = jsonCandidate.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      jsonCandidate = codeBlockMatch[1];
      console.log('Extracted JSON from code block');
    }

    // Try parsing as direct JSON first (since we requested json_object format)
    try {
      const parsed = JSON.parse(jsonCandidate);
      if (parsed.subject && parsed.body) {
        parsedSubject = typeof parsed.subject === 'string' ? parsed.subject.trim() : undefined;
        parsedBody = typeof parsed.body === 'string' ? parsed.body.trim() : undefined;
        console.log('✅ Successfully parsed JSON directly - Subject:', parsedSubject?.substring(0, 50));
        console.log('✅ Successfully parsed JSON directly - Body length:', parsedBody?.length);
      }
    } catch (directParseError) {
      console.warn('Direct JSON parse failed, trying to extract JSON object...');
      
      // Try to extract JSON object from text
      try {
        const trimmed = jsonCandidate.trim();
        const jsonStart = trimmed.indexOf('{');
        const jsonEnd = trimmed.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          const jsonString = trimmed.slice(jsonStart, jsonEnd + 1);
          console.log('Attempting to parse extracted JSON:', jsonString.substring(0, 200));
          const parsed = JSON.parse(jsonString);
          parsedSubject = typeof parsed.subject === 'string' ? parsed.subject.trim() : undefined;
          parsedBody = typeof parsed.body === 'string' ? parsed.body.trim() : undefined;
          console.log('✅ Successfully parsed extracted JSON - Subject:', parsedSubject?.substring(0, 50));
          console.log('✅ Successfully parsed extracted JSON - Body length:', parsedBody?.length);
        }
      } catch (extractParseError) {
        console.error('❌ Failed to parse JSON email content:', extractParseError);
        console.error('Content that failed:', jsonCandidate.substring(0, 500));
      }
    }

    // Fallback to SUBJECT/BODY format if JSON parsing failed
    if (!parsedSubject || !parsedBody) {
      console.log('JSON parsing failed, trying SUBJECT/BODY format...');
      const subjectMatch = generatedContent.match(/SUBJECT:\s*(.+?)(?:\n|$)/i);
      const bodyMatch = generatedContent.match(/BODY:\s*([\s\S]+?)(?:\n\n|$)/i);
      parsedSubject = subjectMatch?.[1]?.trim();
      parsedBody = bodyMatch?.[1]?.trim();
      
      if (parsedSubject && parsedBody) {
        console.log('Found SUBJECT/BODY format - Subject:', parsedSubject.substring(0, 50));
        console.log('Found SUBJECT/BODY format - Body length:', parsedBody.length);
      }
    }

    // Only use fallback if we absolutely cannot parse anything
    if (!parsedSubject || !parsedBody) {
      console.error('=== FALLING BACK TO PERSONALIZED TEMPLATE ===');
      console.error('This should not happen if Groq API is working correctly');
      console.error('Generated content was:', generatedContent.substring(0, 500));
      const fallback = generateFallbackContent(purpose, recipient_type, sender_name, call_to_action, derivedCompany);
      parsedSubject = fallback.subject;
      parsedBody = fallback.description;
    } else {
      console.log('=== SUCCESSFULLY GENERATED PERSONALIZED EMAIL ===');
      console.log('Subject:', parsedSubject);
      console.log('Body preview:', parsedBody.substring(0, 200));
    }

    return {
      subject: parsedSubject,
      description: parsedBody,
      html_body: parsedBody.replace(/\n/g, '<br>')
    };

  } catch (error) {
    console.error('=== ERROR IN EMAIL GENERATION ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('=== END ERROR ===');
    
    // Only fallback if it's a non-critical error
    // If it's an API key issue or API error, we should surface it
    if (error instanceof Error && error.message.includes('GROQ_API_KEY')) {
      throw error; // Re-throw API key errors
    }
    
    // Fallback to structured template for other errors
    console.warn('Falling back to personalized template due to error');
    const derivedCompany = target_company?.trim() || extractCompanyName(target_domain) || 'your company';
    return generateFallbackContent(purpose, recipient_type, sender_name, call_to_action, derivedCompany);
  }
  END OF DISABLED AI CODE */
}

function generateFallbackContent(
  purpose: string, 
  recipient_type: string, 
  sender_name?: string, 
  call_to_action?: string,
  target_company?: string
) {
  const companyName = target_company || 'your company';
  const subject = `Application for Software Developer / AI Engineer Role`;
  
  const body = `Hi ${recipient_type},

I hope you're doing well.

My name is Ayush Pathak, and I am currently pursuing a B.Tech in Data Science & Artificial Intelligence at IIIT Dharwad. I came across your profile and wanted to reach out regarding any Software Development, AI/ML, or Full-Stack Engineering opportunities at ${companyName}.

I have completed multiple software engineering internships, most recently at VideoSDK, where I worked on real-time communication products using WebRTC, React.js, and Node.js. Previously, at Dentsu, I built NLQ-based AI chatbots (OpenAI + Snowflake Cortex) and a real-time monitoring dashboard that improved SLA adherence and observability. I also have experience with TypeScript, Next.js, Prisma, PostgreSQL, Redis, and AI engineering tools such as LangChain, RAG pipelines, and Groq SDK.

Some of my notable work includes:

• Mail.ai – an AI-powered bulk email automation platform (Next.js, Prisma, BullMQ, Redis, Groq SDK).

• AI Code Assistant – a multi-language RAG-based code assistant using Pinecone, FastAPI, and GPT models.

• Competitive Programming – 800+ problems solved; Knight on LeetCode, 3★ on CodeChef.

Given my background in full-stack development, backend engineering, and applied AI, I would love to explore roles where I can contribute to system design, AI integrations, or scalable product engineering.

If there are any open opportunities or if you could point me to the right team, I would greatly appreciate it. I'm also happy to share any additional details or take up a quick call.

Thank you for your time,

Ayush Pathak

📧 22bds044@iiitdwd.ac.in
📞 +91 9316568042
LinkedIn: https://www.linkedin.com/in/ayush-pathak-662768245
GitHub: https://github.com/ayushpath123`;

  // Create properly formatted HTML version with better spacing
  // Using inline styles for maximum email client compatibility
  const html_body = `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
<p style="margin: 10px 0;">Hi ${recipient_type},</p>

<p style="margin: 10px 0;">I hope you're doing well.</p>

<p style="margin: 10px 0;">My name is <strong>Ayush Pathak</strong>, and I am currently pursuing a B.Tech in Data Science &amp; Artificial Intelligence at IIIT Dharwad. I came across your profile and wanted to reach out regarding any Software Development, AI/ML, or Full-Stack Engineering opportunities at <strong>${companyName}</strong>.</p>

<p style="margin: 10px 0;">I have completed multiple software engineering internships, most recently at <strong>VideoSDK</strong>, where I worked on real-time communication products using WebRTC, React.js, and Node.js. Previously, at <strong>Dentsu</strong>, I built NLQ-based AI chatbots (OpenAI + Snowflake Cortex) and a real-time monitoring dashboard that improved SLA adherence and observability. I also have experience with TypeScript, Next.js, Prisma, PostgreSQL, Redis, and AI engineering tools such as LangChain, RAG pipelines, and Groq SDK.</p>

<p style="margin: 10px 0;"><strong>Some of my notable work includes:</strong></p>

<ul style="margin: 10px 0; padding-left: 20px;">
<li style="margin: 8px 0;"><strong>Mail.ai</strong> &ndash; an AI-powered bulk email automation platform (Next.js, Prisma, BullMQ, Redis, Groq SDK).</li>
<li style="margin: 8px 0;"><strong>AI Code Assistant</strong> &ndash; a multi-language RAG-based code assistant using Pinecone, FastAPI, and GPT models.</li>
<li style="margin: 8px 0;"><strong>Competitive Programming</strong> &ndash; 800+ problems solved; Knight on LeetCode, 3★ on CodeChef.</li>
</ul>

<p style="margin: 10px 0;">Given my background in full-stack development, backend engineering, and applied AI, I would love to explore roles where I can contribute to system design, AI integrations, or scalable product engineering.</p>

<p style="margin: 10px 0;">If there are any open opportunities or if you could point me to the right team, I would greatly appreciate it. I'm also happy to share any additional details or take up a quick call.</p>

<p style="margin: 10px 0;">Thank you for your time,</p>

<p style="margin-top: 20px;">
<strong>Ayush Pathak</strong><br>
📧 <a href="mailto:22bds044@iiitdwd.ac.in" style="color: #0066cc; text-decoration: none;">22bds044@iiitdwd.ac.in</a><br>
📞 <a href="tel:+919316568042" style="color: #0066cc; text-decoration: none;">+91 9316568042</a><br>
LinkedIn: <a href="https://www.linkedin.com/in/ayush-pathak-662768245" style="color: #0066cc; text-decoration: none;">https://www.linkedin.com/in/ayush-pathak-662768245</a><br>
GitHub: <a href="https://github.com/ayushpath123" style="color: #0066cc; text-decoration: none;">https://github.com/ayushpath123</a>
</p>
</div>`;

  return {
    subject,
    description: body,
    html_body: html_body
  };
} 