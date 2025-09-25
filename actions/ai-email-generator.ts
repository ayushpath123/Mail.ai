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
  cv_profile
}: {
  purpose: string;
  recipient_type: string;
  industry?: string;
  tone?: string;
  key_points?: string[];
  call_to_action?: string;
  sender_name?: string;
  sender_company?: string;
  target_domain?: string;
  cv_profile?: any;
}) {
  try {
    console.log('Generating AI email content...');
    
    // Extract company name from domain
    const companyName = target_domain ? 
      target_domain.replace(/\.(com|org|net|io|co|ai)$/i, '')
        .split('.')[0]
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ') 
      : 'the company';
    
    // Build CV profile context
    let cvContext = '';
    if (cv_profile) {
      // Personal summary
      if (cv_profile.summary) {
        cvContext += `\nProfessional Summary: ${cv_profile.summary}`;
      }
      
      // Recent experience
      if (cv_profile.experience && cv_profile.experience.length > 0) {
        const recentExp = cv_profile.experience[0];
        cvContext += `\nCurrent/Recent Role: ${recentExp.position} at ${recentExp.company} (${recentExp.duration})`;
        cvContext += `\nKey Achievements: ${recentExp.description}`;
      }
      
      // Education
      if (cv_profile.education && cv_profile.education.length > 0) {
        const education = cv_profile.education[0];
        cvContext += `\nEducation: ${education.degree} in ${education.field} from ${education.institution}`;
      }
      
      // Skills
      if (cv_profile.technicalSkills && cv_profile.technicalSkills.length > 0) {
        cvContext += `\nTechnical Skills: ${cv_profile.technicalSkills.slice(0, 5).join(', ')}`;
      }
      
      // Notable projects
      if (cv_profile.projects && cv_profile.projects.length > 0) {
        const project = cv_profile.projects[0];
        cvContext += `\nNotable Project: ${project.name} - ${project.description}`;
      }
    }

    // Build a comprehensive prompt for AI generation
    const keyPointsText = key_points && key_points.length > 0 
      ? `\nAdditional Key Points: ${key_points.join(', ')}`
      : '';
    
    const industryText = industry ? `\nIndustry Focus: ${industry}` : '';
    
    const prompt = `Generate a highly personalized professional email with the following context:

TARGET COMPANY: ${companyName} (${target_domain})
PURPOSE: ${purpose}
RECIPIENT: ${recipient_type} at ${companyName}
EMAIL TONE: ${tone || 'professional'}

SENDER INFORMATION:
Name: ${cv_profile?.fullName || sender_name || 'Professional'}
${cvContext}${industryText}${keyPointsText}

CALL TO ACTION: ${call_to_action || 'I would appreciate the opportunity to discuss this further'}

INSTRUCTIONS:
Generate a personalized email that:
1. References the specific company (${companyName}) naturally
2. Highlights relevant experience/skills from the sender's background
3. Shows genuine interest in the company/role
4. Demonstrates value the sender can bring
5. Uses a ${tone || 'professional'} tone throughout
6. Includes specific achievements or experiences that relate to the purpose
7. Keeps the email concise (2-3 paragraphs max)
8. Avoids generic templates and makes it feel personal

FORMAT:
SUBJECT: [Compelling subject line mentioning ${companyName} - max 60 chars]
BODY: [Personalized email body]`;

    console.log('AI Prompt:', prompt);

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
            content: 'You are an expert email marketing copywriter. Generate professional, personalized email content that converts.'
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

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0]?.message?.content || '';
    
    console.log('Generated content:', generatedContent);

    // Parse the response
    const subjectMatch = generatedContent.match(/SUBJECT:\s*(.+?)(?:\n|$)/i);
    const bodyMatch = generatedContent.match(/BODY:\s*([\s\S]+?)(?:\n\n|$)/i);

    const subject = subjectMatch ? subjectMatch[1].trim() : `Regarding: ${purpose.substring(0, 40)}...`;
    const body = bodyMatch ? bodyMatch[1].trim() : generateFallbackContent(purpose, recipient_type, sender_name, call_to_action);

    return {
      subject,
      description: body,
      html_body: body.replace(/\n/g, '<br>')
    };

  } catch (error) {
    console.error('Error generating AI email content:', error);
    
    // Fallback to structured template
    return generateFallbackContent(purpose, recipient_type, sender_name, call_to_action);
  }
}

function generateFallbackContent(purpose: string, recipient_type: string, sender_name?: string, call_to_action?: string) {
  const subject = `Regarding: ${purpose.substring(0, 40)}${purpose.length > 40 ? '...' : ''}`;
  
  const body = `Dear ${recipient_type},

I hope this email finds you well. ${purpose}

I believe this could be a great opportunity for mutual benefit, and I would love to discuss this further with you.

${call_to_action || 'I would appreciate the opportunity to connect and explore how we can work together.'}

Looking forward to your response.

Best regards,
${sender_name || 'Your Name'}`;

  return {
    subject,
    description: body,
    html_body: body.replace(/\n/g, '<br>')
  };
} 