import { IsEmail, IsString, MinLength } from 'class-validator';

export default class SignInBodySchema {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(12)
  password!: string;
}
