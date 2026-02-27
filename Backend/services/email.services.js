import nodemailer from "nodemailer"
import asyncHandler from "../utils/asyncHandler.js"




export const generateOTP= asyncHandler(async () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
})

export const sendOTPEmail = asyncHandler(async (email, otp) => {
  // 1. Setup transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 465,
    secure: true, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Email content
  const mailOptions = {
    from: `"Vidflare 🔐" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your One-Time Password (OTP)",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 10px; border: 1px solid #ddd; max-width: 400px; margin: auto;">
        <h2 style="color: #333;">🔐 OTP Verification</h2>
        <p>Hello,</p>
        <p>Use the following OTP to complete your verification:</p>
        <h1 style="background: #f4f4f4; padding: 10px; text-align: center;">${otp}</h1>
        <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
        <br/>
        <p style="font-size: 12px; color: #777;">If you didn’t request this, you can ignore this email.</p>
      </div>
    `,
  };

  // 3. Send email
  await transporter.sendMail(mailOptions);

});
