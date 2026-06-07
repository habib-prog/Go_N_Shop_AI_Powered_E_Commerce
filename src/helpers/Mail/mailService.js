const nodemailer = require("nodemailer");

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const mailService = async ({ email, sub, otp, msg, template }) => {
  try {
    await transporter.sendMail({
      from: `Go N Shop ${process.env.SMTP_USER}`, // sender address
      to: email, // list of recipients
      subject: sub, // subject line
      text: msg, // plain text body
      html: template, // HTML body
    });
  } catch (err) {
    console.error("Error while sending mail:", err);
    throw err;
  }
};

module.exports = mailService;
