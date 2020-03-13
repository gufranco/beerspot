import { IsIn, ValidateIf, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { RoleType } from '../entities/Role';
import UserSchema from './UserSchema';
import CompanySchema from './CompanySchema';

export default class SignUpBodySchema {
  /*
   * If a customer is being persisted, only the user's object
   * must be validated. Otherwise, user's object and company's
   * object must be validated.
   */
  @IsIn(['customer', 'provider'])
  type!: RoleType;

  @ValidateNested()
  @IsNotEmpty()
  @Type(() => UserSchema)
  user!: UserSchema;

  @ValidateIf((signUpBodySchema) => signUpBodySchema.type === 'provider')
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => CompanySchema)
  company!: CompanySchema;
}
