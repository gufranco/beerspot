import { Entity, ManyToOne, Column, Index } from 'typeorm';
import Address from './Address';
// eslint-disable-next-line import/no-cycle
import User from './User';

@Entity()
export default class AdditionalAddress extends Address {
  @Index()
  @ManyToOne(
    () => User,
    (user: User) => user.additionalAddresses,
    {
      nullable: false,
    },
  )
  user!: User;

  @Column({
    length: 32,
  })
  name!: string;
}
