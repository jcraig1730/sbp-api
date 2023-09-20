import { User } from 'src/users/entities/user.entity';

export class CreateAppointmentDto {
  userId: string;
  user?: User;
  paid: boolean;
  startTime: string;
  type: 'package 1' | 'package 2' | 'package 3' | 'lifestyle/newborn';
}
