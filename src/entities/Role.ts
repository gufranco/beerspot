import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import User from './User';

export type RoleType = 'customer' | 'provider' | 'administrator';

@Entity()
export default class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  // @ts-ignore
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

  @Index()
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn({
    nullable: true,
  })
  updatedAt!: Date | null;
}
