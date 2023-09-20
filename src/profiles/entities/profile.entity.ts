import { User } from 'src/users/entities/user.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id?: string;
  @Column()
  firstName: string;
  @Column()
  lastName: string;
  @Column()
  phone: string;
  @Column({ nullable: true })
  street?: string;
  @Column({ nullable: true })
  state?: string;
  @Column({ nullable: true })
  city?: string;
  @Column({ nullable: true })
  zip?: string;
  @OneToOne(() => User, (user) => user.profile)
  user: User;
}
