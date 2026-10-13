
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const user = process.env.GMAIL_USER?.trim();
const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");

// Check environment variables
console.log("Gmail configured:", Boolean(user));
console.log("App password configured:", Boolean(pass));

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user,
        pass,
    },
});

// Verify Gmail SMTP connection
transporter.verify()
    .then(() => {
        console.log("Gmail SMTP connected successfully");
    })
    .catch((error) => {
        console.log("SMTP Error:", error.message);
    });
