import { IsEmail, IsString, MinLength } from 'class-validator';

export default class UserSignInBodySchema {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(12)
  password!: string;
}
