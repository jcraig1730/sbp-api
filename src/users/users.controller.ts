import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateAlbumDto } from 'src/albums/dto/create-album.dto';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles-guard.guard';
import { IsOwnerOrMaster } from 'src/auth/is-owner-or-master.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('master')
  @Get('test-route')
  getAll() {
    return this.usersService.getAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('master')
  @Post(':userId/albums')
  createUserAlbum(@Param() params, @Body() data: CreateAlbumDto) {
    return this.usersService.createAlbum(params.userId, data);
  }

  @UseGuards(JwtAuthGuard, IsOwnerOrMaster)
  @Get('profile')
  getProfile() {}
}
