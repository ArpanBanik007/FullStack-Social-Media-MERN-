import nodemailer from "nodemailer"
import asyncHandler from "../utils/asyncHandler.js"




export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


export const sendOTPEmail = async (email, otp) => {
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
    from: `"Pluto Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Pluto Email Verification Code",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; color: #333333; border: 1px solid #eaeaec; border-radius: 8px;">
        <h2 style="margin-top: 0; color: #111111;">Email Verification</h2>
        <p style="font-size: 15px; line-height: 1.5; margin-bottom: 24px;">
          Hello,
        </p>
        <p style="font-size: 15px; line-height: 1.5; margin-bottom: 24px;">
          Please use the verification code below to complete your registration with Pluto.
        </p>
        <div style="background-color: #f4f4f5; padding: 16px; border-radius: 6px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #000000;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #555555; margin-bottom: 32px;">
          This code will expire in 3 minutes.
        </p>
        <hr style="border: none; border-top: 1px solid #eaeaea; margin-bottom: 20px;" />
        <p style="font-size: 12px; color: #888888; margin: 0;">
          If you didn’t request this, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  // 3. Send email
  await transporter.sendMail(mailOptions);
};
