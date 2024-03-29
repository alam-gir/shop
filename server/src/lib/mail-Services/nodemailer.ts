import { createTransport, SendMailOptions } from "nodemailer";

const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMail = async (options: SendMailOptions) => {
  try {
    return await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    return null;
  }
};
