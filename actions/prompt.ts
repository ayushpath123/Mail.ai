import { Together } from 'together-ai';

type inputSchema = {
  first_name: string;
  last_name: string;
  domain: string;
};

// Initialize Together with your API key
const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

export async function Groqfns({ first_name, last_name, domain, custom_prompt }: inputSchema & { custom_prompt?: string }) {
  const prompt = custom_prompt || `Generate **exactly 10 unique professional email suggestions** based strictly on the following input:

  - **First Name**: ${first_name}
  - **Last Name**: ${last_name}
  - **Domain**: ${domain}
  
  ### ✅ Professional Email Patterns (Only these 10 — absolutely no other formats allowed):
  1. firstname.lastname@domain (e.g., john.doe@company.com)
  2. firstname@domain (e.g., john@company.com)
  3. firstnamelastname@domain (e.g., johndoe@company.com)
  4. firstname_lastname@domain (e.g., john_doe@company.com)
  5. lastname.firstname@domain (e.g., doe.john@company.com)
  6. firstinitial.lastname@domain (e.g., j.doe@company.com)
  7. firstname_last@domain (e.g., john_d@company.com)
  8. firstinitiallastname@domain (e.g., jdoe@company.com)
  9. lastname@domain (e.g., doe@company.com)
  10. firstname.last@domain (e.g., john.d@company.com)

  ### 📧 Response Format:
  Return ONLY the 10 email addresses, one per line, with no additional text, explanations, or formatting.`;
  

  try {
    const response = await together.chat.completions.create({
      model: "meta-llama/Llama-3-70b-chat-hf",
      messages: [
        { role: "system", content: "You are an AI assistant that generates email addresses." },
        { role: "user", content: prompt },
      ],
    });

    const output = response.choices[0]?.message?.content;

    return output
      ? output
          .split('\n')
          .map((s) => s.replace(/^\d+\.\s*/, '').trim())
          .filter(Boolean)
      : [];
  } catch (error) {
    console.error('Error generating email suggestions using Together:', error);
    throw new Error('Failed to generate email suggestions');
  }
}
