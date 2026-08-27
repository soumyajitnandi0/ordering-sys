import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email, orderId, tokenNumber, pdfBase64 } = await request.json();

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json(
        { error: 'Email service is not configured on the Vercel server. Please check environment variables.' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS?.replace(/\s+/g, '')
      }
    });

    const base64Data = pdfBase64.includes('base64,') ? pdfBase64.split('base64,')[1] : pdfBase64;
    const pdfBuffer = Buffer.from(base64Data, 'base64');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Your Receipt from Waffle Circle (Order #${tokenNumber.toString().padStart(3, '0')})`,
      html: `
        <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 100%; background-color: #000000; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #111111; border: 1px solid #333333; border-radius: 12px; overflow: hidden;">
            <div style="text-align: center; padding: 40px 20px; border-bottom: 1px solid #222222;">
              <img src="https://raw.githubusercontent.com/soumyajitnandi0/ordering-sys/main/frontend/public/logo.jpeg" alt="Waffle Circle Logo" style="width: 80px; height: 80px; border-radius: 50%; border: 2px solid #E6B462; margin-bottom: 20px; display: inline-block; object-fit: cover;"/>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 4px;">WAFFLE CIRCLE</h1>
              <p style="color: #E6B462; margin: 10px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; font-weight: 600;">Premium Waffle & Mocktail Counter</p>
            </div>
            <div style="padding: 40px 30px;">
              <h2 style="color: #ffffff; margin: 0 0 20px 0; font-size: 22px; font-weight: 600;">Thank You for Your Visit</h2>
              <p style="color: #cccccc; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">
                Dear Guest, <br><br>
                Thank you for choosing Waffle Circle. It was our absolute privilege to serve you. We are deeply committed to ensuring your experience is nothing short of exceptional.
              </p>
              <div style="background-color: #1a1a1a; border-left: 3px solid #E6B462; padding: 15px 20px; margin-bottom: 30px;">
                <p style="margin: 0; color: #ffffff; font-size: 14px; font-weight: 500;">Please find your official receipt attached to this email.</p>
              </div>
              <p style="color: #cccccc; font-size: 15px; line-height: 1.6; margin-bottom: 40px;">
                If you have any feedback or require further assistance, please do not hesitate to reach out to our team. We look forward to welcoming you back soon.
              </p>
              <div>
                <p style="margin: 0; color: #aaaaaa; font-size: 14px;">Warmest regards,</p>
                <p style="margin: 5px 0 0 0; color: #ffffff; font-weight: bold; font-size: 16px; letter-spacing: 1px;">Waffle Circle Management</p>
              </div>
            </div>
            <div style="background-color: #0a0a0a; padding: 20px; text-align: center;">
              <p style="margin: 0; color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Join our community</p>
              <p style="margin: 8px 0 0 0;">
                <a href="https://instagram.com/waffle.circle" style="color: #E6B462; text-decoration: none; font-weight: bold; font-size: 13px; letter-spacing: 1px;">INSTAGRAM: @WAFFLE.CIRCLE</a>
              </p>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `WaffleCircle_Receipt_${tokenNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // We can use await here because Vercel doesn't block SMTP outbound
    await transporter.sendMail(mailOptions);
    
    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Next.js API Email Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
