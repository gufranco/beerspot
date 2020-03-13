import {
  CreateDateColumn,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export default abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @CreateDateColumn()
  createdAt!: Date;

  @Index()
  @UpdateDateColumn({
    nullable: true,
    default: null,
  })
  updatedAt!: Date | null;
}
