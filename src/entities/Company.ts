import { Column, Entity, OneToOne, Index, JoinColumn } from 'typeorm';
import BaseEntity from './BaseEntity';
// eslint-disable-next-line import/no-cycle
import User from './User';
import Address from './Address';

@Entity()
export default class Company extends BaseEntity {
  @OneToOne(
    () => User,
    (user: User) => user.company,
  )
  user!: User;

  @Index()
  @OneToOne(() => Address, {
    nullable: false,
  })
  @JoinColumn()
  address!: Address;

  @Column({
    length: 64,
  })
  name!: string;

  @Column({
    unique: true,
    length: 14,
  })
  document!: string;

  @Column({
    default: 5,
  })
  radius!: number;
}
