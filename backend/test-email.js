require('dotenv').config();
const nodemailer = require('nodemailer');

async function test() {
  console.log('Testing email with user:', process.env.EMAIL_USER);
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS?.replace(/\s+/g, '')
    },
    connectionTimeout: 10000,
    socketTimeout: 15000
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test Email',
      text: 'This is a test'
    });
    console.log('Success!', info);
  } catch (err) {
    console.error('Error sending email:', err);
  }
}
test();
