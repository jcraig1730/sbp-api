import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseInterceptors,
  UseGuards,
  UnauthorizedException,
  UploadedFiles,
} from '@nestjs/common';
import { AlbumsService } from './albums.service';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { CreatePhotosDto } from 'src/photos/dto/create-photo.dto';
import { Request } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles-guard.guard';
import { Roles } from 'src/auth/roles.decorator';
import { IsOwnerOrMaster } from 'src/auth/is-owner-or-master.guard';

@Controller('albums')
export class AlbumsController {
  constructor(private readonly albumsService: AlbumsService) {}

  @Post('/:albumId/photos')
  @UseInterceptors(FilesInterceptor('files'))
  addPhoto(
    @Body() dto: CreatePhotosDto,
    @Req() req: Request,
    @Param() params: any,
    @UploadedFiles() files,
  ) {
    return this.albumsService.addPhotos(params.albumId, dto, files);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/users/:userId')
  getAlbumsByUser(@Param() params: any, @Req() req) {
    if (req.user.id !== params.userId) throw new UnauthorizedException();
    return this.albumsService.getAlbumsByUser(params.userId);
  }

  @Get()
  findAll() {
    return this.albumsService.findAll();
  }

  @UseGuards(JwtAuthGuard, IsOwnerOrMaster)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.albumsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('master')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAlbumDto: UpdateAlbumDto) {
    return this.albumsService.update(+id, updateAlbumDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('master')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.albumsService.remove(+id);
  }
}
