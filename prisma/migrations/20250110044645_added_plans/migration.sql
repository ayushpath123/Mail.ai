-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PREMIUM', 'STANDARD');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "SMTP_USER" TEXT NOT NULL DEFAULT '',
    "SMTP_PASS" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "day_id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "noOfEmails" INTEGER NOT NULL,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("day_id")
);

-- CreateTable
CREATE TABLE "Email" (
    "id" SERIAL NOT NULL,
    "emailLogId" INTEGER NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_SMTP_USER_key" ON "User"("SMTP_USER");

-- CreateIndex
CREATE UNIQUE INDEX "User_SMTP_PASS_key" ON "User"("SMTP_PASS");

-- CreateIndex
CREATE INDEX "EmailLog_date_idx" ON "EmailLog"("date");

-- CreateIndex
CREATE UNIQUE INDEX "EmailLog_userId_date_key" ON "EmailLog"("userId", "date");

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_emailLogId_fkey" FOREIGN KEY ("emailLogId") REFERENCES "EmailLog"("day_id") ON DELETE RESTRICT ON UPDATE CASCADE;
