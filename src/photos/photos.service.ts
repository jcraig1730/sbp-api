import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Photo } from './entities/photo.entity';
import { Repository } from 'typeorm';
import { Album } from 'src/albums/entities/album.entity';

@Injectable()
export class PhotosService {
  constructor(
    private readonly cloudinary: CloudinaryService,
    @InjectRepository(Photo) private readonly photoRepo: Repository<Photo>,
  ) {}
  async create(dto: { name: string; album: Album }, file: Express.Multer.File) {
    const cloudinaryUpload = await this.cloudinary
      .uploadImage(file)
      .catch(() => {
        throw new BadRequestException('Invalid file type.');
      });

    const photo = this.photoRepo.create({ ...dto, url: cloudinaryUpload.url });
    await this.photoRepo.save(photo);
    return photo;
  }

  findAll() {
    return `This action returns all photos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} photo`;
  }

  update(id: number, updatePhotoDto: UpdatePhotoDto) {
    return `This action updates a #${id} photo`;
  }

  remove(id: number) {
    return `This action removes a #${id} photo`;
  }
}
