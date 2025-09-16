// src/services/emailService.js

/**
 * Sends an OTP email.
 * IMPORTANT: This is a placeholder/simulation.
 * For a real application, you must install and configure an email library
 * like Nodemailer (npm install nodemailer).
 */
const sendOTP = async (email, otp, type) => {
  const subject =
    type === "verification"
      ? "Verify Your Email Address"
      : "Your One-Time Password";

  const body = `Your verification code is: ${otp}. It will expire in 10 minutes.`;

  console.log("--------------------");
  console.log(`📧  Email Sent (Simulation)`);
  console.log(`To: ${email}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
  console.log("--------------------");

  // Example of real implementation with Nodemailer:
  //
  // import nodemailer from 'nodemailer';
  //
  // const transporter = nodemailer.createTransport({
  //   service: 'gmail', // or your email provider
  //   auth: {
  //     user: process.env.EMAIL_USER,
  //     pass: process.env.EMAIL_PASS,
  //   },
  // });
  //
  // await transporter.sendMail({
  //   from: process.env.EMAIL_FROM,
  //   to: email,
  //   subject: subject,
  //   text: body,
  // });

  return Promise.resolve();
};

export const EmailService = {
  sendOTP,
};
