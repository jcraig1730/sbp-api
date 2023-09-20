import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import Stripe from 'stripe';
import { PaymentsService } from 'src/payments/payments.service';
import { ProfilesService } from 'src/profiles/profiles.service';
import { CreateProfileDto } from 'src/profiles/dto/create-profile.dto';
import { CreateAlbumDto } from 'src/albums/dto/create-album.dto';
import { AlbumsService } from 'src/albums/albums.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private profilesService: ProfilesService,
    private paymentsService: PaymentsService,
    private albumsService: AlbumsService,
  ) {}

  async findOne(email: string): Promise<User | undefined> {
    return await this.usersRepository.findOneBy({ email });
  }

  async getAll() {
    const result = await this.usersRepository.find();
    return result;
  }

  async create(data: { user: User; profile: CreateProfileDto }) {
    const paymentUserParams: Stripe.CustomerCreateParams = {
      name: `${data.profile.firstName} ${data.profile.lastName}`,
      email: data.user.email,
      phone: data.profile.phone,
      address: {
        city: data.profile.city,
        line1: data.profile.street,
        state: data.profile.state,
        postal_code: data.profile.zip,
      },
    };
    const stripeUserData = await this.paymentsService.createPaymentUser(
      paymentUserParams,
    );
    const profile = await this.profilesService.create({
      ...data.profile,
    });
    const result = this.usersRepository.create({
      profile,
      ...data.user,
      stripeId: stripeUserData.id,
    });
    await this.usersRepository.save(result);

    return result;
  }

  async verifyUserEmail(userId: string) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    Object.assign(user, { emailConfirmed: true, confirmationCode: null });

    await this.usersRepository.save(user);
  }

  async createAlbum(userId: string, data: CreateAlbumDto) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    const newAlbum = await this.albumsService.create({ user, name: data.name });
    return newAlbum;
  }
}
