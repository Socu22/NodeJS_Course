import nodemailer from "nodemailer";

// ⚠️ Use app password (Gmail) or just mock it
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "your@email.com",
        pass: "your-app-password"
    }
});

export function sendSignupEmail(email, username) {
    return transporter.sendMail({
        from: "Auth System",
        to: email,
        subject: "Welcome!",
        text: `Hello ${username}, your account was created successfully 🎉`
    });
}