import { Column, Entity } from 'typeorm';
import BaseEntity from './BaseEntity';

@Entity()
export default class Address extends BaseEntity {
  @Column({
    length: 64,
  })
  street!: string;

  @Column()
  number!: number;

  @Column({
    nullable: true,
  })
  complement!: string;

  @Column({ length: 32 })
  neighborhood!: string;

  @Column({ length: 32 })
  city!: string;

  @Column({ length: 32 })
  state!: string;

  @Column({ length: 8 })
  zipCode!: string;

  @Column({ type: 'float' })
  latitude!: number;

  @Column({ type: 'float' })
  longitude!: number;
}
