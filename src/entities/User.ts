import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import Role from './Role';

export type StatusType = 'peding' | 'enabled' | 'disabled';

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id!: number;

  // @ts-ignore
  @ManyToOne(
    () => Role,
    (role: Role) => role.users,
    {
      nullable: false,
    },
  )
  role!: Role;

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
    enum: ['peding', 'enabled', 'disabled'],
    default: 'peding',
  })
  status!: StatusType;

  @Column({
    length: 32,
  })
  firstName!: string;

  @Column({
    length: 32,
  })
  lastName!: string;

  @Column({
    type: 'date',
  })
  birthDate!: Date;

  @Column({
    unique: true,
  })
  phone!: string;

  @CreateDateColumn()
  @Index()
  createdAt!: Date;

  @UpdateDateColumn({
    nullable: true,
  })
  updatedAt!: Date | null;
}
