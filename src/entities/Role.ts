import { Column, Entity, Index, OneToMany } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import User from './User';
import BaseEntity from './BaseEntity';

export type RoleType = 'customer' | 'provider' | 'administrator';

@Entity()
export default class Role extends BaseEntity {
  @OneToMany(
    () => User,
    (user: User) => user.role,
  )
  users!: User[];

  @Index()
  @Column({
    type: 'enum',
    enum: ['customer', 'provider', 'administrator'],
    default: 'customer',
    unique: true,
  })
  type!: RoleType;
}
