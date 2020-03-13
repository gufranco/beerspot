/* eslint-disable import/no-cycle */
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import Role from './Role';
import Company from './Company';
import BaseEntity from './BaseEntity';
import Address from './Address';
import AdditionalAddress from './AdditionalAddress';

export type StatusType = 'pending' | 'enabled' | 'disabled';

@Entity()
export default class User extends BaseEntity {
  @ManyToOne(
    () => Role,
    (role: Role) => role.users,
    {
      nullable: false,
    },
  )
  role!: Role;

  @Index()
  @OneToOne(() => Address, {
    nullable: false,
  })
  @JoinColumn()
  address!: Address;

  @OneToMany(
    () => AdditionalAddress,
    (additionalAddress) => additionalAddress.user,
    {
      nullable: true,
    },
  )
  additionalAddresses!: AdditionalAddress[];

  @Index()
  @OneToOne(() => Company, {
    nullable: true,
  })
  @JoinColumn()
  company!: Company;

  @Column({
    unique: true,
  })
  @Index()
  email!: string;

  @Column({
    length: 64,
  })
  password!: string;

  @Index()
  @Column({
    type: 'enum',
    enum: ['pending', 'enabled', 'disabled'],
    default: 'pending',
  })
  status!: StatusType;

  @Column({
    length: 64,
  })
  name!: string;

  @Column({
    type: 'date',
  })
  birthDate!: Date;

  @Column({
    unique: true,
    length: 11,
  })
  document!: string;

  @Column({
    unique: true,
  })
  phone!: string;
}
