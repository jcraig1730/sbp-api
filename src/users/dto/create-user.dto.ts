import { CreateProfileDto } from 'src/profiles/dto/create-profile.dto';

export class CreateUserDto {
  email: string;
  password: string;
  confirmationCode?: string;
  profile: CreateProfileDto;
}
