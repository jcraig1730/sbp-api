import { Album } from 'src/albums/entities/album.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Profile } from 'src/profiles/entities/profile.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ unique: true })
  email: string;

  @Column()
  hash: string;

  @Column()
  salt: string;

  @Column({ default: false })
  emailConfirmed?: boolean;

  @Column({ nullable: true })
  confirmationCode?: string;

  @OneToOne(() => Profile, { eager: true })
  @JoinColumn()
  profile?: Profile;

  @Column({ nullable: true })
  stripeId: string;

  @OneToMany(() => Appointment, (a) => a.user, { eager: true })
  appointments?: Appointment[];

  @OneToMany(() => Album, (a) => a.user, { eager: true })
  albums?: Album[];

  @Column({ default: 'user' })
  role?: string;
}
