require('dotenv').config();
const nodemailer = require('nodemailer');
const dns = require('dns');
const { promisify } = require('util');
const resolve4 = promisify(dns.resolve4);

async function test() {
  console.log('Testing email with user:', process.env.EMAIL_USER);
  
  let smtpHost = 'smtp.gmail.com';
  try {
    const ips = await resolve4('smtp.gmail.com');
    if (ips && ips.length > 0) {
      smtpHost = ips[0];
      console.log('Resolved IPv4:', smtpHost);
    }
  } catch (e) {
    console.error('Failed to resolve smtp.gmail.com IPv4', e);
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS?.replace(/\s+/g, '')
    },
    tls: {
      servername: 'smtp.gmail.com',
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    socketTimeout: 15000
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Test Email DNS',
      text: 'This is a test with DNS resolve4'
    });
    console.log('Success!', info);
  } catch (err) {
    console.error('Error sending email:', err);
  }
}
test();
