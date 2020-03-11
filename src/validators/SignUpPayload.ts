import {
  IsEmail, Length, MaxLength, IsPhoneNumber, IsIn, IsISO8601,
} from 'class-validator';
import { RoleType } from '../entities/Role';

export default class SignUpPayload {
  @IsEmail()
  email!: string;

  @Length(12, 64)
  password!: string;

  @MaxLength(32)
  firstName!: string;

  @MaxLength(32)
  lastName!: string;

  @IsISO8601()
  birthDate!: string;

  @IsPhoneNumber('BR')
  phone!: string;

  @IsIn(['customer', 'provider'])
  type!: RoleType;
}
