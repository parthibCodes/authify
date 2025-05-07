import nodemailer from "nodemailer";

const sendResetEmail = async(email,link)=>{
    const transporter = nodemailer.createTransport({
        host:"smtp.gmail.com",
        port:465,
        secure:true,
        auth:{
            user:process.env.email,
            pass:process.env.pass
        }
    });
    const info = await transporter.sendMail({
        from:`Authify <${process.env.email}>`,
        to:email,
        subject:"Reset password",
        text:`Click on this link to reset the password: ${link}`
    });
    console.log(`Message sent: ${info.messageId}`);
}

export {sendResetEmail};
