import nodemailer from 'nodemailer'

type mail_type={
     user_details:{
     useremail:string,
     user_id:number
     },   
     groqemails:string[],
     mail_body:{
        subject:string,
        description:string
     }
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

export  async function handleEmails({user_details,groqemails,mail_body}:mail_type) {
        
        const {useremail}= user_details;
        const {subject,description}=mail_body;
        for (let i = 0; i < groqemails.length; i++) {
                const mailide=`${groqemails[i]}`;
                console.log(mailide);
                const mailOptions: nodemailer.SendMailOptions = {
                    from: useremail,
                    to: mailide,
                    subject: subject,
                    text: description,
                  };
                
                  transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                      console.error(`Error sending email to ${groqemails[i]}:`, error);
                    } else {
                      console.log(`Email sent to ${groqemails[i]}:`, info.response);
                    }
                  });
        }          
} 