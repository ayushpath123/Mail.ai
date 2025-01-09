import Hunterfn from "@/actions/hunterapi";
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
    const {user_id,first_name,last_name,domain,SMTP_USER,SMTP_PASSWORD,mail_body}=body;
    try{
      const zodValidation = inputValidation.parse(body);
    }catch(error){
      if(error instanceof z.ZodError){
         const errormessages=error.errors.map(e=>e.message);
         return NextResponse.json({
          msg:"Validation Failed"
         },{
         status:501
         })
      }
    }
    // const hunterres=await Hunterfn({
    //   first_name,last_name,domain
    // })

    const groqemails=await Groqfns({
      first_name,last_name,domain
    })
    
    // const hunterEmail=hunterres?.email
    // const allEmails = Array.from(new Set([...(groqemails || []), ...(hunterEmail ? [hunterEmail] : [])]));
    
    //console.log(allEmails);

    const user_details={
      useremail:"22bds044@gmail.com",
      user_id
    }

    //Prisma Logic here
    
    handleEmails({
    user_details,
    groqemails,
    mail_body,
    }); 

    return NextResponse.json({
      msg:"Email Sent Successfull",
      emails:"Grog emails :"+groqemails
    },{
      status:200
    })
  }