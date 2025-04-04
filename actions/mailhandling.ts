import nodemailer from 'nodemailer';

type mail_type = {
  user_details: {
    useremail: string;
    user_id: number;
  };
  groqemails: string[];
  mail_body: {
    subject: string;
    description: string;
  };
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function handleEmails({ user_details, groqemails, mail_body }: mail_type) {
  const { subject, description } = mail_body;

  for (let i = 0; i < groqemails.length; i++) {
    const mailide = groqemails[i].replace(/\s+/g, "").toLowerCase();
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Ayush Pathak" <${process.env.SMTP_USER}>`,
      to: mailide,
      subject,
      text: description,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${mailide}:`, info.response);
    } catch (error) {
      console.error(`Error sending email to ${mailide}:`);
    }
  }
  return true;
}
