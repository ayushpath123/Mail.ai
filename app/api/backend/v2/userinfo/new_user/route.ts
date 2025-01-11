import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export  async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();
  try {
    const res = await prisma.user.create({
      data: {
        name,
        email,
        password,
        // SMTP_USER:"",
        // SMTP_PASS:""
      },
      select: {
        id: true,
      },
    });
    return NextResponse.json(
      {
        msg: "User Created Successfully",
        res,
      },
      {
        status: 200,
      }
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      {
        msg: "User Creation Unsuccessful",
      },
      {
        status: 343,
      }
    );
  }
}
