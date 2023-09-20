import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ProfilesModule } from 'src/profiles/profiles.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { AlbumsModule } from 'src/albums/albums.module';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
  imports: [
    ProfilesModule,
    AlbumsModule,
    PaymentsModule,
    TypeOrmModule.forFeature([User]),
  ],
})
export class UsersModule {}
