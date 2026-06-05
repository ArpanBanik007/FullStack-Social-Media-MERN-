import fetch from "node-fetch";

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTPEmail = async (email, otp) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: "Pluto Support",
        email: process.env.BREVO_SMTP_USER,
      },
      to: [{ email }],
      subject: "Pluto Email Verification Code",
      htmlContent: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
                    max-width: 520px; margin: 40px auto; background-color: #ffffff; 
                    border-radius: 12px; overflow: hidden; 
                    box-shadow: 0 4px 24px rgba(0,0,0,0.08); border: 1px solid #eaeaec;">
          
          <div style="background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%); 
                      padding: 32px 40px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 800; 
                       color: #ffffff; letter-spacing: -0.5px;">🪐 Pluto</h1>
            <p style="margin: 6px 0 0; color: #a0a0b0; font-size: 13px;">Social Network</p>
          </div>

          <div style="padding: 40px 40px 32px;">
            <h2 style="margin: 0 0 12px; font-size: 20px; color: #111111; font-weight: 700;">
              Verify your email address
            </h2>
            <p style="margin: 0 0 28px; font-size: 15px; color: #555555; line-height: 1.6;">
              Hi there! Use the verification code below to complete your 
              registration. This code expires in <strong>3 minutes</strong>.
            </p>

            <div style="background: linear-gradient(135deg, #f8f8ff 0%, #f0f0ff 100%);
                        border: 2px dashed #c7c7e0; border-radius: 10px; 
                        padding: 24px; text-align: center; margin-bottom: 28px;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #888888; 
                        text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">
                Your OTP Code
              </p>
              <span style="font-size: 42px; font-weight: 800; letter-spacing: 10px; 
                           color: #1a1a2e; font-family: 'Courier New', monospace;">
                ${otp}
              </span>
            </div>

            <div style="background-color: #fff8e1; border-left: 4px solid #f6c90e; 
                        border-radius: 6px; padding: 14px 16px; margin-bottom: 28px;">
              <p style="margin: 0; font-size: 13px; color: #7a6000; line-height: 1.5;">
                ⚠️ <strong>Never share this code</strong> with anyone. 
                Pluto will never ask for your OTP via phone or chat.
              </p>
            </div>

            <p style="margin: 0; font-size: 14px; color: #888888; line-height: 1.6;">
              Didn't request this? You can safely ignore this email.
            </p>
          </div>

          <div style="background-color: #f9f9fb; padding: 20px 40px; 
                      border-top: 1px solid #eaeaec; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #aaaaaa;">
              © ${new Date().getFullYear()} Pluto Social Network · All rights reserved
            </p>
          </div>
        </div>
      `,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("❌ Brevo API error:", data);
    throw new Error(data.message || "Failed to send email");
  }

  console.log("✅ OTP Email sent:", data.messageId);
};