import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { genSalt, hash } from 'bcrypt';
import { EmailService } from 'src/email/email.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async registerUser(dto: CreateUserDto) {
    const salt = await genSalt();
    const hashed = await hash(dto.password, salt);
    const user = { email: dto.email, hash: hashed, salt };
    const confirmationCode = this.genConfirmationCode();

    await this.usersService.create({
      profile: dto.profile,
      user: { ...user, stripeId: '', confirmationCode },
    });
    await this.emailService.sendEmail(
      user.email,
      'Confirm Account',
      this.genConfirmationEmail(confirmationCode),
    );
    return { success: true };
  }

  async confirmUserEmail(user: User, confirmationCode: string) {
    if (user.confirmationCode === confirmationCode) {
      await this.usersService.verifyUserEmail(user.id);
      return { success: true };
    }
    return { success: false };
  }

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findOne(username);
    if (!user) return null;
    const hashed = await hash(password, user.salt);
    if (hashed === user.hash) return user;
    return null;
  }

  async getUser(email: string) {
    const user = await this.usersService.findOne(email);
    await user.appointments;
    return user;
  }

  async login(user: any) {
    const payload = { user: user, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      success: true,
    };
  }

  private genConfirmationCode() {
    return Math.floor(Math.random() * 10000)
      .toString()
      .padStart(5, '0');
  }

  private genConfirmationEmail(confirmationCode) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation Email</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f3e9e0;
            padding: 2em;
        }
        .container {
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.1);
        }
        .button {
            display: inline-block;
            padding: 10px 15px;
            color: #fff;
            background-color: #b57f68;
            border: none;
            border-radius: 4px;
            text-decoration: none;
        }
        .ii a[href] {
          text-decoration: none;
          color: #fff;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Hey there, Memory Keeper!</h2>
        <p>
            Remember the smell of old photographs? The touch of photo albums? Those memories aren't just clicks, they're timeless treasures. 📷
        </p>
        <p>
            Just as every picture tells a story, every photo session with us ensures that your family's special moments are framed forever, be it as a gentle reminder on your work desk or a grand portrait in your living room.
        </p>
        <p>
            Speaking of memories, here's one more step to embark on a beautiful journey with us!
        </p>
        <a href="${this.configService.get(
          'UI_URL',
        )}/login?token=${confirmationCode}" class="button">Confirm Your Email</a>
        <p>
            Let's create moments together that you can cherish, display, and reminisce for years to come!
        </p>
        <p>With warmest regards,<br>Shelby Bolden</p>
    </div>
</body>
</html>
`;
  }
}
