import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('contact-form')
  createContact(
    @Body()
    body: {
      name: string;
      subject: string;
      text: string;
      email: string;
    },
  ) {
    return this.emailService.sendContactForm(
      body.email,
      body.name,
      body.subject,
      body.text,
    );
  }
}
