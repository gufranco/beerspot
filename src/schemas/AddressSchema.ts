import {
  IsNotEmpty,
  IsNumberString,
  MaxLength,
  IsNumber,
  IsOptional,
  Matches,
} from 'class-validator';

export default class AddressSchema {
  @IsNotEmpty()
  @MaxLength(64)
  street!: string;

  @IsNumber()
  number!: number;

  @IsOptional()
  @IsNotEmpty()
  @MaxLength(32)
  complement!: string;

  @IsNotEmpty()
  @MaxLength(32)
  neighborhood!: string;

  @IsNumberString()
  @Matches(/(\d{8})/)
  zipCode!: string;
}
