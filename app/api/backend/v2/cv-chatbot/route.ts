import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ------------------------------
// HARD-CODED CV DATA (SAFE)
// ------------------------------

const HARDCODED_CV = `
Name: Ayush Pathak
Email: 22bds044@iiitdwd.ac.in
Phone: +91 9316568042
LinkedIn: https://www.linkedin.com/in/ayush-pathak-662768245
GitHub: https://github.com/ayushpath123

Education:
- B.Tech in Data Science & Artificial Intelligence, IIIT Dharwad (2022–2026)

Experience:
- Software Developer Intern, VideoSDK (Oct 2025 – Present)
  • Built scalable WebRTC-based real-time communication products.
  • Worked with React.js, Node.js, WebRTC, distributed systems.

- Software Developer Intern, Dentsu (Jun 2025 – Jul 2025)
  • Built NLQ-based AI chatbots using GPT-4o + Snowflake Cortex.
  • Developed monitoring dashboard for 2000+ daily jobs.
  • Improved RCA/observability, reduced recrawls by 35%.

- Software Developer Intern, DataAstraa (Aug 2024 – Sep 2024)
  • Migrated 1000+ lines to TypeScript architecture.
  • Server-side pagination + MongoDB optimization (1.8s → 400ms)
  • Built reusable React hooks reducing boilerplate by 60%.

Projects:
- Mail.ai
  Tech: Next.js, Prisma, PostgreSQL, Stripe, BullMQ, Redis, Groq SDK
  • AI-powered bulk email platform with 40% faster delivery.
  • Built subscription + usage billing system.

- AI Code Assistant
  Tech: Python, LangChain, GPT-4, FastAPI, Pinecone, React
  • RAG-based code assistant for multi-language code generation.
  • Intelligent debugging + context-aware suggestions.

Achievements:
- Knight (1800+) on LeetCode
- 800+ DSA problems solved
- 3★ CodeChef, Pupil Codeforces
- Hackathon winner: secure login system for IIIT staff

Technical Skills:
Languages: TypeScript, JavaScript, C++, Python, SQL, C
Web: HTML, CSS, Tailwind
Frameworks: React, Next.js, Express, Hono, Node.js, Prisma, NextAuth
Databases: PostgreSQL, MongoDB, Pinecone
AI/Agentic Tools: LangChain, AutoGen, OpenAI, RAG, MCP Servers, Vector Stores
`;

const CV_KEYWORDS = [
  "cv", "resume", "job", "career", "interview",
  "experience", "education", "project", "skills"
];


export async function POST(req: NextRequest) {
  try {
    // Check user session
    const session = await getServerSession(NEXT_AUTH);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { message, subject } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const text = (message + " " + (subject || "")).toLowerCase();
    const shouldUseCV = CV_KEYWORDS.some(keyword => text.includes(keyword));

    const systemPrompt = `
You are a friendly personal assistant.
Use a professional tone ONLY if the user asks for CV/resume/job/career help.
If relevant, use the hard-coded CV below.
`;

    const userPrompt = shouldUseCV
      ? `User message: ${message}\n\nHere is the CV:\n${HARDCODED_CV}`
      : message;

    // Safety check
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({ error: "Groq API key missing" }, { status: 500 });
    }

    // Call Groq
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    const data = await response.json();

    return NextResponse.json({
      success: true,
      response: data.choices?.[0]?.message?.content || "No response."
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}
