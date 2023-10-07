import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Query,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { Response } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles-guard.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    if (req.user.emailConfirmed === false) {
      throw new HttpException(
        'Please login through the link that has been sent to your email in order to confirm your account.',
        HttpStatus.FORBIDDEN,
      );
    }
    const result = await this.authService.login(req.user);
    res.cookie('bearer', result.access_token, { httpOnly: true });
    return res.send({ success: true });
  }

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.authService.registerUser(dto);
  }

  @Patch('update-password')
  async updatePassword(
    @Body() dto: { newPassword: string; email: string },
    @Query('token') confirmationCode: string,
  ) {
    return this.authService.updatePassword(
      confirmationCode,
      dto.email,
      dto.newPassword,
    );
  }

  @Post('forgot-password')
  async forgotPassword(@Query('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @UseGuards(AuthGuard('local'))
  @Post('confirm-email')
  async confirmEmail(
    @Request() req,
    @Query('token') confirmationCode,
    @Res({ passthrough: true }) res,
  ) {
    await this.authService.confirmUserEmail(req.user, confirmationCode);
    const result = this.authService.login(req.user);
    res.cookie('bearer', (await result).access_token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-token')
  async verifyToken(@Req() request) {
    return this.authService.getUser(request.user.email);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('master')
  @Post('authenticate-master')
  async authenticateMaster() {
    return { authenticated: true };
  }
}
