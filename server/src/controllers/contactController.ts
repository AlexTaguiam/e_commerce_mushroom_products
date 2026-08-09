import { Request, Response } from "express";
import { Resend } from "resend";
import { sendResponse } from "../utils/reponseHandler";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactMessage(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { name, email, phone, message } = req.body;

    // Input validation handled upstream by sendContactMessageSchema + validate() middleware.

    const toEmail = process.env.CONTACT_EMAIL_TO;
    if (!toEmail) {
      console.error("CONTACT_EMAIL_TO is not set in environment variables");
      sendResponse(res, 500, "Server email configuration error");
      return;
    }

    await resend.emails.send({
      from: "B&J's Contact Form <onboarding@resend.dev>",
      to: toEmail,
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    sendResponse(res, 200, "Message sent successfully");
  } catch (error) {
    console.error("Error in sendContactMessage:", error);
    sendResponse(res, 500, "Failed to send message");
  }
}
