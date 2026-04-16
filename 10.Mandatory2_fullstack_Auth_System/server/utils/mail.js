import nodemailer from "nodemailer";

// Production setup (Gmail)
/*
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "your@email.com", 
        pass: "your-app-password" 
    }
});*/

// Mock/testing setup (Ethereal Email)
// Uncomment the following block to use Ethereal for testing
const testAccount = await nodemailer.createTestAccount();
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
});


export async function sendSignupEmail(email, username) {
    try {
        const info = await transporter.sendMail({
            from: '"Auth System" <your@email.com>',
            to: email,
            subject: "Welcome!",
            text: `Hello ${username}, your account was created successfully 🎉`,
            html: `<b>Hello ${username}, your account was created successfully 🎉</b>`,
        });
                
        // For testing: log the preview URL
        if (process.env.NODE_ENV === 'test') {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }

        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}