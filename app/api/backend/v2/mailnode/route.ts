// import Hunterfn from "@/actions/hunterapi";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod'; 
import { Groqfns } from "@/actions/prompt";
import { handleEmails } from "@/actions/mailhandling";
import { db } from "@/lib/prisma";

type inputschema = {
  user_id?:number,
  first_name: string,
  last_name: string,
  domain: string,
  SMTP_USER?: string,
  SMTP_PASSWORD?: string,
  custom_prompt?: string,
  mail_body?:{
    subject:string,
    description:string
  }
}

const inputValidation = z.object({
  user_id:z.number().min(1,"Input is Required"),
  first_name: z.string().min(3, "Input is Required"),
  last_name: z.string().min(3, "Input is Required"),
  domain: z.string().min(2, "Domain is Required"),
  SMTP_USER: z.string().min(3, "Credentials are Required"),
  SMTP_PASSWORD: z.string().min(3, "Credentials are Required"),
  mail_body:z.object({
    subject:z.string().min(2,"Strings cannot be empty"),
    description:z.string().min(10,"Strings cannot be empty")
  })
})

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {  
    
    const body: inputschema = await req.json();
    const {first_name,last_name,domain,custom_prompt}=body;
    
    // Load user resume details if available
    let resumeUrl: string | undefined;
    let resumeText: string | undefined;
    if (body.user_id) {
      try {
        const user = await db.user.findUnique({
          where: { id: Number(body.user_id) },
          select: { resumeUrl: true, resumeText: true }
        });
        resumeUrl = user?.resumeUrl || undefined;
        resumeText = user?.resumeText || undefined;
      } catch {}
    }

    // Generate emails using custom prompt or default
    const groqemails=await Groqfns({
      first_name,last_name,domain,custom_prompt
    })

    // Generate personalized content using custom prompt or resumeText
    let mail_body = {
      subject: "Application for Summer Internship",
      description: `Dear Hiring Team,
    
    I hope this message finds you well. I am reaching out to express my interest in a software development internship at your organization.
    
    I have hands-on experience building full-stack applications using technologies like Next.js, React, Node.js, Express, Prisma, and PostgreSQL. Through various personal and collaborative projects, I've focused on solving real-world problems with clean, efficient code. I'm also proficient with tools like Docker, GitHub, CI/CD pipelines, and cloud deployment.
    
    I am eager to contribute to a growth-oriented team, learn from experienced engineers, and take on new challenges. I am confident in my ability to adapt quickly, work independently or in teams, and bring value through technical and problem-solving skills.
    
    Thank you for considering my application. I would be grateful for the opportunity to contribute and learn.
    
    Best regards,  
    Ayush Pathak`
    }

    // If custom prompt is provided, generate personalized content
    if (custom_prompt) {
      try {
        const contentResponse = await Groqfns({
          first_name: "Content",
          last_name: "Generator",
          domain: "content.com",
          custom_prompt: `Generate a professional email based on this context: ${custom_prompt}
          
          Please provide:
          1. A compelling subject line
          2. A professional email body that incorporates the context
          
          Format as JSON:
          {
            "subject": "Subject line here",
            "description": "Email body here"
          }`
        });

        // Try to parse the response as JSON
        try {
          const contentData = JSON.parse(contentResponse as any);
          if (contentData.subject && contentData.description) {
            mail_body = {
              subject: contentData.subject,
              description: contentData.description
            };
          }
        } catch (parseError) {
          // If JSON parsing fails, use the response as description
          mail_body = {
            subject: `Regarding: ${custom_prompt.substring(0, 40)}`,
            description: Array.isArray(contentResponse) ? contentResponse.join("\n") : String(contentResponse)
          };
        }
      } catch (error) {
        console.error('Error generating personalized content:', error);
      }
    }
    // If no custom prompt but resumeText exists, build a personalized body from resume
    else if (resumeText) {
      const intro = `Dear Hiring Team,\n\nI am reaching out to express my interest in opportunities at your organization. Below is a brief summary based on my resume:`;
      const summary = resumeText.slice(0, 1200); // keep reasonable length
      mail_body = {
        subject: `Application from ${first_name} ${last_name}`,
        description: `${intro}\n\n${summary}\n\nI have attached my CV for your review.\n\nBest regards,\n${first_name} ${last_name}`
      };
    }
    
    // Only send emails if SMTP credentials are provided
    if (body.SMTP_USER && body.SMTP_PASSWORD && body.user_id) {
      const user_details={
        useremail:"ayushpathak308@gmail.com",
        user_id: body.user_id
      }

      handleEmails({
        user_details,
        groqemails,
        mail_body,
        attachmentPath: resumeUrl,
      });
    }
    
    return NextResponse.json({
      msg:"Content Generated Successfully",
      emails: groqemails,
      subject: mail_body.subject,
      description: mail_body.description,
      resumeUrl: resumeUrl || null
    },{
      status:200
    })
  }