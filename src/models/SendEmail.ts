import nodemailer from "nodemailer";

export const sendEmail = async (to: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS, 
    },
  });

  const mailOptions = {
    from: `"AddaGhor" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: "Verify Your Account - AddaGhor",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #f97316;">Welcome to AddaGhor!</h2>
        <p>Your verification code is:</p>
        <h1 style="background: #f3f4f6; padding: 10px; text-align: center; letter-spacing: 5px; color: #333;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
