import { Injectable } from '@nestjs/common';
import { UpdateAlbumDto } from './dto/update-album.dto';
import {
  CreatePhotoDto,
  CreatePhotosDto,
} from 'src/photos/dto/create-photo.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Album } from './entities/album.entity';
import { Repository } from 'typeorm';
import { PhotosService } from 'src/photos/photos.service';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AlbumsService {
  constructor(
    @InjectRepository(Album) private readonly albumRepo: Repository<Album>,
    private readonly photoService: PhotosService,
  ) {}
  async create(dto: { name: string; user: User }) {
    const result = this.albumRepo.create(dto);
    await this.albumRepo.save(result);
    return result;
  }

  async addPhoto(
    albumId: string,
    dto: CreatePhotoDto,
    file: Express.Multer.File,
  ) {
    const album = await this.albumRepo.findOneBy({ id: albumId });
    const photoCreateData = { name: dto.name, album };
    const newPhoto = await this.photoService.create(photoCreateData, file);
    return newPhoto;
  }

  async addPhotos(
    albumId: string,
    dto: CreatePhotosDto,
    files: Express.Multer.File[],
  ) {
    const album = await this.albumRepo.findOneBy({ id: albumId });
    const newPhotos = files.map((file, index) => {
      const photoCreateData = { name: dto[index], album };
      return this.photoService.create(photoCreateData, file);
    });
    await Promise.all(newPhotos);
    return newPhotos;
  }

  async getAlbumsByUser(userId: string) {
    return this.albumRepo.findBy({ userId });
  }

  findAll() {
    return `This action returns all albums`;
  }

  findOne(id: number) {
    return `This action returns a #${id} album`;
  }

  update(id: number, dto: UpdateAlbumDto) {
    return `This action updates a #${id} album`;
  }

  remove(id: number) {
    return `This action removes a #${id} album`;
  }
}
