import {Resend} from 'resend';
import {ApiError} from './ApiError.js';
import { configDotenv } from 'dotenv';

configDotenv();
const resend = new Resend(process.env.RESEND_API_KEY);
const sendEmail = async (to, subject, text) => {
    try {
        
        const email = await resend.emails.send({
            from: 'abhinav@shipfast.studio',
            to: to,
            subject: subject,
            html: `<strong>${text}</strong>`,
        });
        if (!email) {
            throw new ApiError("Failed to send email");
        }
        // Simulate success
        return true;
    } catch (error) {
        console.error(`Failed to send email: ${error.message}`);
        return false;
    }
}

export default sendEmail;