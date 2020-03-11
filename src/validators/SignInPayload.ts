import { MinLength, IsEmail } from 'class-validator';

export default class SignInPayload {
  @IsEmail()
  email!: string;

  @MinLength(12)
  password!: string;
}
