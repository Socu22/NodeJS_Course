import nodemailer from 'nodemailer';
import 'dotenv/config.js';

let transporter;

// ==========================
// PRODUCTION MAIL TRANSPORT
// ==========================
if (process.env.NODE_ENV === 'production') {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  console.log('Using production mail transporter');


// ==========================
// DEVELOPMENT / TEST MAIL
// ==========================
} else {
  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });

  console.log('Using Ethereal test mail transporter');
}

// ==========================
// SIGNUP EMAIL
// ==========================
export async function sendSignupEmail(email, username) {
  try {
    const info = await transporter.sendMail({
      from: `"Auth System" <${process.env.MAIL_USER || 'test@ethereal.email'}>`,
      to: email,
      subject: 'Welcome!',
      text: `Hello ${username}, your account was created successfully 🎉`,
      html: `<b>Hello ${username}, your account was created successfully 🎉</b>`
    });

    // Show preview URL in non-production
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        'Preview URL:',
        nodemailer.getTestMessageUrl(info)
      );
    }

    return info;

  } catch (error) {
    console.error('Error sending signup email:', error);
    throw error;
  }
}

// ==========================
// RESET TOKEN EMAIL
// ==========================
export async function sendForgotPasswordResetTokenEmail(
  email,
  username,
  token
) {
  try {
    const info = await transporter.sendMail({
      from: `"Auth System" <${process.env.MAIL_USER || 'test@ethereal.email'}>`,
      to: email,
      subject: 'Password Reset Token',
      text: `Hello ${username}, your verification token is: ${token}`,
      html: `
        <b>Hello ${username}</b>
        <p>Your verification token is:</p>
        <h2>${token}</h2>
      `
    });

    // Show preview URL in non-production
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        'Preview URL:',
        nodemailer.getTestMessageUrl(info)
      );
    }

    return info;

  } catch (error) {
    console.error('Error sending reset email:', error);
    throw error;
  }
}