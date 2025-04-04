// import Hunterfn from "@/actions/hunterapi";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod'; 
import { Groqfns } from "@/actions/prompt";
import { handleEmails } from "@/actions/mailhandling";

type inputschema = {
  user_id:number,
  first_name: string,
  last_name: string,
  domain: string,
  SMTP_USER: string,
  SMTP_PASSWORD: string,
  mail_body:{
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
    const {first_name,last_name,domain}=body;
    // try{
    //   const zodValidation = inputValidation.parse(body);
    // }catch(error){
    //   if(error instanceof z.ZodError){
    //      const errormessages=error.errors.map(e=>e.message);
    //      return NextResponse.json({
    //       msg:"Validation Failed"
    //      },{
    //      status:501
    //      })
    //   }
    // }
    // const hunterres=await Hunterfn({
    //   first_name,last_name,domain
    // })

    const mail_body = {
      subject: "Application for Summer Internship",
      description: `Dear Hiring Team,
    
    I hope this message finds you well. I am reaching out to express my interest in a software development internship at your organization.
    
    I have hands-on experience building full-stack applications using technologies like Next.js, React, Node.js, Express, Prisma, and PostgreSQL. Through various personal and collaborative projects, I’ve focused on solving real-world problems with clean, efficient code. I’m also proficient with tools like Docker, GitHub, CI/CD pipelines, and cloud deployment.
    
    I am eager to contribute to a growth-oriented team, learn from experienced engineers, and take on new challenges. I am confident in my ability to adapt quickly, work independently or in teams, and bring value through technical and problem-solving skills.
    
    Thank you for considering my application. I would be grateful for the opportunity to contribute and learn.
    
    Best regards,  
    Ayush Pathak`
    }
    

    const groqemails=await Groqfns({
      first_name,last_name,domain
    })
    
    // const hunterEmail=hunterres?.email
    // const allEmails = Array.from(new Set([...(groqemails || []), ...(hunterEmail ? [hunterEmail] : [])]));
    
    //console.log(allEmails);

    const user_details={
      useremail:"ayushpathak308@gmail.com",
      user_id:213213
    }

    //Prisma Logic here
    
    handleEmails({
    user_details,
    groqemails,
    mail_body,
    }); 
    
    // if(!checker){
    //   return NextResponse.json({
    //     msg:"Error",
    //     emails:"Grog emails :"+groqemails
    //   },{
    //     status:501
    //   })
    // }
    return NextResponse.json({
      msg:"Email Sent Successfull",
      emails:"Grog emails :"+groqemails
    },{
      status:200
    })
  }