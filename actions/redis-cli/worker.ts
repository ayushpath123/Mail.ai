import { createClient } from "redis";
import nodemailer from 'nodemailer';
const client = createClient();
const noOfemails = 53;
let noOfprocessed = 0;
const earlyQuitLimit = 53; 

async function processSubmission(email: string) {
    const trimmedEmail = email.replace(/^\d+\.\s*/, '');
    console.log("Processing email: " + trimmedEmail);
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: "ayushpathak308@gmail.com",
          pass: "citd ufgt pzjc kavm",
        },
      });
      try {
        await transporter.sendMail({
          from: `"Mail.ai" <${process.env.SMTP_USER}>`,
          to: email,
          subject: 'Mail Agent testing',
          text: `Hey Everyone this is nothing but the test mail`,
        });
      } catch (error) {
        console.error('Error sending OTP:', error);
      }
    noOfprocessed++;
    if (noOfprocessed >= earlyQuitLimit) {
        console.log("Early quit: Processed " + noOfprocessed + " emails.");
        return true;
    }
    return false;
}

async function startWorker() {
    try {
        await client.connect();
        console.log("Worker connected to Redis.");

        while (noOfprocessed < noOfemails) {
            try {
                const value = await client.rPop("emails");

                if (value) {
                    console.log("Email popped from the queue: " + value);
                    const shouldQuitEarly = await processSubmission(value);
   
                    if (shouldQuitEarly) {
                        console.log("Worker quitting early.");
                        break;
                    }
                } else {
                    console.log("No emails in the queue, retrying...");
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.error("Error processing submission:", error);
            }
        }

        console.log("Worker completed processing.");
        await client.quit();
    } catch (error) {
        console.error("Failed to connect to Redis:", error);
    }
}
export default startWorker;
