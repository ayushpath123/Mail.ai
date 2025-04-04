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

export async function Groqfns({ first_name, last_name, domain }: inputSchema) {
  const prompt = `Generate **exactly 10 unique professional email suggestions** based strictly on the following input:

  - **First Name**: ${first_name}
  - **Last Name**: ${last_name}
  - **Domain**: ${domain}
  
  ### ✅ Allowed Patterns (Only these 10 — absolutely no other formats allowed):
  1. first_name@domain  
  2. first_namelast_name@domain  
  3. first_name_lastname@domain  
  4. first_namelast@domain  
  5. first_name_last@domain  
  6. last_name@domain  
  7. last_namefirst@domain  
  8. firstnamelastname@domain  
  9. lastfirstnam@domain  
  10. firstnamelast@domain  
  
  ### 🚨 STRICT RULES:
  - Use **only** the 10 allowed patterns above — no others, no exceptions.
  - ⚠️ **No duplicates** — all 10 emails must be completely **unique** in structure and content.
  - ❌ Do **not** use nicknames, initials, numbers, random characters, or extra variations.
  - ❌ Do **not** repeat the same format with different separators.
  - ❌ Do **not** include any explanation, notes, or headings.
  - ✅ Output **only 10 email addresses**, numbered **1 through 10**, each on a new line.
  
  ### Output Format:
  1. example@domain.com  
  2. example.lastname@domain.com  
  ...  
  10. lastfirstnam@domain.com
  `;
  

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
