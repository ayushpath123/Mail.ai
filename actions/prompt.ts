import axios from 'axios';

import { Groq } from 'groq-sdk'; 

const groq = new Groq({
    apiKey:process.env.GROQ_API, 
  });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

type inputSchema={
     first_name:string,
     last_name:string,
     domain:string
}

export async function Groqfns({first_name,last_name,domain}:inputSchema) {
  const prompt = `Generate **exactly 10 unique professional email suggestions** based on the following input details:

- **First Name**: ${first_name}
- **Last Name**: ${last_name}
- **Domain**: ${domain}

### Email Suggestions Must Follow These Strict Patterns:
1. **first_name@domain** (e.g., ayush@google.com)
2. **first_name.last_name@domain** (e.g., ayush.pathak@google.com)
3. **first_name_lastname@domain** (e.g., ayush_pathak@google.com)
4. **first_name.last@domain** (e.g., ayush.p@google.com)
5. **first_name_last@domain** (e.g., ayush_p@google.com)
6. **last_name@domain** (e.g., pathak@google.com)
7. **last_name.first@domain** (e.g., pathak.ayush@google.com)
8. **firstnamelastname@domain** (e.g., ayushpathak@google.com)
9. **lastfirstnam@domain** (e.g., pathakayush@google.com)
10. **firstnamelast@domain** (e.g., ayushpath@google.com)

### **Strict Guidelines:**
- **Only** generate email suggestions based on the **10 specified patterns above**. Do not generate emails that are **not** in these patterns.
- Ensure all email suggestions are **unique**. **No duplicates** are allowed—each email should be different from others.
- **Do not include any variations** outside of the 10 patterns, such as **nicknames**, **personal identifiers**, or **random combinations**.
- Ensure all suggestions are **professional** and suitable for business or formal contexts.
- **Only provide email suggestions**; **no explanations**, **examples**, or additional context are allowed. 
- Ensure that all email addresses are properly formed with @domain.com

### **Example Input**:
- **First Name**: Ayush
- **Last Name**: Pathak
- **Domain**: google

### **Example Output**:
1. ayush@google.com
2. ayush.pathak@google.com
3. ayush_pathak@google.com
4. ayush.p@google.com
5. ayush_p@google.com
6. pathak@google.com
7. pathak.ayush@google.com
8. ayushpathak@google.com
9. pathakayush@google.com
10. ayushpath@google.com

### Format Requirements:
- The output must consist of **exactly 10 unique emails**.
- Each email should be formatted as 'email1@domain.com', 'email2@domain.com', ..., 'email50@domain.com'.
- Do not generate any extra lines, explanations, or irrelevant content.

### **Final Requirements:**
- The email suggestions must **strictly follow the above patterns** and must be **unique**.
- Anything beyond the defined patterns will be **rejected**.

**No Duplicates Allowed.** Only valid, unique, professional email suggestions are to be provided`


  try {
    const response = await groq.chat.completions.create({
      model: 'mixtral-8x7b-32768',  // Use the appropriate model from Groq
      messages: [
        { role: 'system', content: 'You are an email generator AI.' },
        { role: 'user', content: prompt }
      ],
    });
   // console.log(response.choices[0].message.content);

   const suggestions = response.choices[0]?.message?.content;
   return suggestions
  ? suggestions
      .split('\n') // Split by new line to get each line
      .map((s) => s.replace(/^\d+\.\s*/, '').trim()) // Remove numbers and trim spaces
      .filter(Boolean) // Filter out empty values
  : [];


  } catch (error) {
    console.error('Error generating email suggestions using Groq:', error);
    throw new Error('Failed to generate email suggestions');
  }
}