import nodemailer from "nodemailer";
import dotenv from 'dotenv'
dotenv.config()

//generate otp
const generateOtp = () => {
  return Math.floor(Math.random() * 9000 + 1000);
};

//send mail
export const sendMail = async (email,req) => {
  try {
    const otp = generateOtp();
    console.log(otp);
    req.session.otp = otp

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: true,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: "OTP || MOTO MOTION",
      text: `Thank you for choosing MOTO MOTION. Use this otp to finish your signup: ${otp}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log(`Email has been sent to ${email}, info.response`);
      }
    });

    return otp;
  } catch (error) {
    console.log(error);
    throw error;
  }
};