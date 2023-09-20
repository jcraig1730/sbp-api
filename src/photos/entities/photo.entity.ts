import { Album } from 'src/albums/entities/album.entity';
import { Column, ManyToOne, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity()
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Album, (a) => a.photos)
  album?: Album;

  @Column({ nullable: true })
  name?: string;

  @Column()
  url: string;

  @Column({ default: false })
  favorite: boolean;
}
