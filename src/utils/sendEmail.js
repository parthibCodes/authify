import nodemailer from "nodemailer";
import { User } from "../models/user.model.js";

const sendEmail = async (email, userId) => {
  // Create transporter with Gmail SMTP
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.email,
      pass: process.env.pass,
    },
  });

  // Generate access token from user model
  const user = await User.findById(userId);
  const userToken = await user.generateAccessToken();

  // Send email
  const info = await transporter.sendMail({
    from: process.env.email,
    to: email,
    subject: "Verify your email",
    text: `Please open this link to validate your email address: http://localhost:6000/api/v1/users/verify/${userToken} \nThanks`,
  });

  console.log(`Message sent: ${info.messageId}`);
};

export { sendEmail };
