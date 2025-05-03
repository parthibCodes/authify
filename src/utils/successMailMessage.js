import nodemailer from "nodemailer";

export const successMail = async(email)=>{
    const transporter = nodemailer.createTransport({
        host:"smtp.gmail.com",
        port:465,
        secure:true,
        auth:{
            user: process.env.email,
            pass: process.env.pass,
        }
    });
    const info = await transporter.sendMail({
        from:process.env.email,
        to:email,
        subject:"Your email has been verified successfully ✅",
        text:"Congratulations! Your email has been successfully verified.",
        html: `<p>🎉 <strong>Congratulations!</strong> Your email has been successfully verified.</p>`,
    });
    console.log(`Verification success email sent successfully ${info.messageId}`);
}
