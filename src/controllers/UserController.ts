import { getCustomRepository } from 'typeorm';
import { Service, Inject } from 'typedi';
import {
  JsonController,
  Post,
  Body,
  UnauthorizedError,
  BadRequestError,
  Get,
  Param,
} from 'routing-controllers';
import Role from '../entities/Role';
import UserRepository from '../repositories/UserRepository';
import RoleRepository from '../repositories/RoleRepository';
import User from '../entities/User';
import { HttpSignInResponseInterface } from '../interfaces/HttpInterface';
import UserSignInBodySchema from '../schemas/UserSignInBodySchema';
import UserSignUpBodySchema from '../schemas/UserSignUpBodySchema';
import BcryptHelper from '../helpers/BcryptHelper';
import JwtHelper from '../helpers/JwtHelper';
import Address from '../entities/Address';
import AddressRepository from '../repositories/AddressRepository';
import Company from '../entities/Company';
import CompanyRepository from '../repositories/CompanyRepository';
import MailHelper from '../helpers/MailHelper';

@Service()
@JsonController('/users')
export default class UserController {
  @Inject()
  private bcryptHelper!: BcryptHelper;

  @Inject()
  private jwtHelper!: JwtHelper;

  @Inject()
  private mailHelper!: MailHelper;

  private userRepository: UserRepository = getCustomRepository(UserRepository);

  private roleRepository: RoleRepository = getCustomRepository(RoleRepository);

  private addressRepository: AddressRepository = getCustomRepository(
    AddressRepository,
  );

  private companyRepository: CompanyRepository = getCustomRepository(
    CompanyRepository,
  );

  @Post('/sign_in')
  public async signIn(
    @Body({ required: true }) signInBodySchema: UserSignInBodySchema,
  ): Promise<HttpSignInResponseInterface | undefined> {
    const { email, password } = signInBodySchema;

    let user: User;
    try {
      user = await this.userRepository.findByEmail(email);
    } catch (exception) {
      throw new UnauthorizedError();
    }

    if (
      user.status !== 'enabled' ||
      !(await this.bcryptHelper.compare(password, user.password))
    ) {
      throw new UnauthorizedError();
    }

    return {
      userId: user.id,
      role: user.role.type,
      token: await this.jwtHelper.createToken({ userId: user.id }),
    };
  }

  @Post('/sign_up')
  public async signUp(
    @Body({ required: true }) body: UserSignUpBodySchema,
  ): Promise<User> {
    const { type } = body;

    let user: User;
    switch (type) {
      case 'customer':
        user = await this.signUpCustomer(body);
        break;
      case 'provider':
        user = await this.signUpProvider(body);
        break;
      default:
        throw new BadRequestError();
    }

    try {
      await this.mailHelper.sendConfirmation(user);
    } catch (exception) {
      // eslint-disable-next-line no-console
      console.error(exception, user);
    }

    delete user.password;
    return user;
  }

  public async signUpCustomer(body: UserSignUpBodySchema): Promise<User> {
    let role: Role;
    try {
      role = await this.roleRepository.findByType(body.type);
    } catch (exception) {
      throw new BadRequestError(exception.detail);
    }

    let address: Address = new Address();
    try {
      address.street = body.user.address.street;
      address.number = body.user.address.number;
      address.complement = body.user.address.complement;
      address.neighborhood = body.user.address.neighborhood;
      address.zipCode = body.user.address.zipCode;

      address = await this.addressRepository.save(address);
    } catch (exception) {
      throw new BadRequestError(exception.detail);
    }

    let user: User = new User();
    try {
      user.role = role;
      user.address = address;
      user.email = body.user.email;
      user.password = await this.bcryptHelper.hash(body.user.password);
      user.status = 'pending';
      user.name = body.user.name;
      user.birthDate = new Date(body.user.birthDate);
      user.document = body.user.document;
      user.phone = body.user.phone;

      user = await this.userRepository.save(user);
    } catch (exception) {
      throw new BadRequestError(exception.detail);
    }

    return user;
  }

  public async signUpProvider(body: UserSignUpBodySchema): Promise<User> {
    let role: Role;
    try {
      role = await this.roleRepository.findByType(body.type);
    } catch (exception) {
      throw new BadRequestError(exception.detail);
    }

    let address: Address = new Address();
    try {
      address.street = body.user.address.street;
      address.number = body.user.address.number;
      address.complement = body.user.address.complement;
      address.neighborhood = body.user.address.neighborhood;
      address.zipCode = body.user.address.zipCode;

      address = await this.addressRepository.save(address);
    } catch (exception) {
      throw new BadRequestError(exception.detail);
    }

    let companyAddress: Address = new Address();
    try {
      companyAddress.street = body.user.address.street;
      companyAddress.number = body.user.address.number;
      companyAddress.complement = body.user.address.complement;
      companyAddress.neighborhood = body.user.address.neighborhood;
      companyAddress.zipCode = body.user.address.zipCode;

      companyAddress = await this.addressRepository.save(companyAddress);
    } catch (exception) {
      throw new BadRequestError(exception.detail);
    }

    let company: Company = new Company();
    try {
      company.address = companyAddress;
      company.name = body.company.name;
      company.document = body.company.document;
      company.radius = body.company.radius;

      company = await this.companyRepository.save(company);
    } catch (exception) {
      throw new BadRequestError(exception.detail);
    }

    let user: User = new User();
    try {
      user.role = role;
      user.address = address;
      user.company = company;
      user.email = body.user.email;
      user.password = await this.bcryptHelper.hash(body.user.password);
      user.status = 'pending';
      user.name = body.user.name;
      user.birthDate = new Date(body.user.birthDate);
      user.document = body.user.document;
      user.phone = body.user.phone;

      user = await this.userRepository.save(user);
    } catch (exception) {
      throw new BadRequestError(exception.detail);
    }

    return user;
  }

  @Get('/validate/:id/:hash')
  public async validate(
    @Param('id') id: number,
    @Param('hash') hash: string,
  ): Promise<User> {
    let user: User;
    try {
      user = await this.userRepository.findById(id);
    } catch (exception) {
      throw new UnauthorizedError();
    }

    if (
      user.status !== 'pending' ||
      !(await this.bcryptHelper.compare(hash, user.createdAt.toISOString()))
    ) {
      throw new UnauthorizedError();
    }

    user.status = 'enabled';
    user = await this.userRepository.save(user);

    delete user.password;
    return user;
  }
}
