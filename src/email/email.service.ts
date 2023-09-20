import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private email = process.env.email;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: this.email,
        pass: process.env.NODE_MAILER_PASSWORD,
      },
    });
  }

  async sendEmail(to: string, subject: string, text: string): Promise<void> {
    const mailOptions = {
      from: 'Shelby Bolden',
      to: to,
      subject: subject,
      html: text,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendContactForm(email: string, name, subject: string, text: string) {
    const mailOptions = {
      to: this.email,
      subject,
      text: `From: ${name}
  Email: ${email}
      
  ${text}`,
    };
    await this.transporter.sendMail(mailOptions);
    return { success: true };
  }
}
