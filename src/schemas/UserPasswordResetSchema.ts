import { IsEmail, Matches, IsNumberString } from 'class-validator';

export default class UserPasswordResetSchema {
  @IsEmail()
  email!: string;

  @IsNumberString()
  @Matches(/(\d{11})/)
  document!: string;
}
