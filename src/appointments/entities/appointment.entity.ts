import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (u) => u)
  user?: User;

  @Column({ default: false })
  paid: boolean;

  @Column()
  startTime: string;

  @Column({
    enum: ['package 1', 'package 2', 'package 3', 'lifestyle/newborn'],
  })
  type: 'package 1' | 'package 2' | 'package 3' | 'lifestyle/newborn';
}
