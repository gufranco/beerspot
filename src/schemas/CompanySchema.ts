import {
  IsNotEmpty,
  IsNumberString,
  ValidateNested,
  MaxLength,
  IsNumber,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import AddressSchema from './AddressSchema';

export default class CompanySchema {
  @IsNotEmpty()
  @MaxLength(64)
  name!: string;

  @IsNumberString()
  @Matches(/(\d{14})/)
  document!: string;

  @IsNumber()
  @Min(5)
  @Max(10)
  radius!: number;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => AddressSchema)
  address!: AddressSchema;
}
