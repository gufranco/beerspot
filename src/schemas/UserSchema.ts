import {
  IsNotEmpty,
  IsEmail,
  IsString,
  MinLength,
  IsISO8601,
  IsNumberString,
  IsPhoneNumber,
  ValidateNested,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import AddressSchema from './AddressSchema';

export default class UserSchema {
  @IsNotEmpty()
  @MaxLength(64)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(12)
  password!: string;

  @IsISO8601()
  birthDate!: string;

  @IsNumberString()
  @Matches(/(\d{11})/)
  document!: string;

  @IsPhoneNumber('BR')
  phone!: string;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => AddressSchema)
  address!: AddressSchema;
}
