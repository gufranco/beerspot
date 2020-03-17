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
  OnUndefined,
  InternalServerError,
} from 'routing-controllers';
import Role from '../entities/Role';
import UserRepository from '../repositories/UserRepository';
import RoleRepository from '../repositories/RoleRepository';
import User from '../entities/User';
import { HttpSignInResponseInterface } from '../interfaces/HttpInterface';
import UserSignInBodySchema from '../schemas/UserSignInBodySchema';
import UserSignUpBodySchema from '../schemas/UserSignUpBodySchema';
import CryptoHelper from '../helpers/CryptoHelper';
import JwtHelper from '../helpers/JwtHelper';
import MailHelper from '../helpers/MailHelper';
import Address from '../entities/Address';
import AddressRepository from '../repositories/AddressRepository';
import Company from '../entities/Company';
import CompanyRepository from '../repositories/CompanyRepository';
import UserPasswordResetSchema from '../schemas/UserPasswordResetSchema';
import { GeoPosition } from '../interfaces/GeocodeInterface';
import LocationHelper from '../helpers/LocationHelper';

@Service()
@JsonController('/users')
export default class UserController {
  @Inject()
  private cryptoHelper!: CryptoHelper;

  @Inject()
  private jwtHelper!: JwtHelper;

  @Inject()
  private mailHelper!: MailHelper;

  @Inject()
  private locationHelper!: LocationHelper;

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
      !(await this.cryptoHelper.compare(password, user.password))
    ) {
      throw new UnauthorizedError();
    }

    delete user.password;

    return {
      user,
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
      await this.mailHelper.askForConfirmation(user);
    } catch (exception) {
      throw new InternalServerError(exception.message);
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

    let addressPosition: GeoPosition;
    try {
      addressPosition = await this.locationHelper.getPosition(
        body.user.address.street,
        body.user.address.number,
        body.user.address.neighborhood,
        body.user.address.zipCode,
      );
    } catch (exception) {
      throw new BadRequestError(exception.message);
    }

    let address: Address = new Address();
    try {
      address.street = body.user.address.street;
      address.number = body.user.address.number;
      address.complement = body.user.address.complement;
      address.neighborhood = body.user.address.neighborhood;
      address.city = body.user.address.city;
      address.state = body.user.address.state;
      address.zipCode = body.user.address.zipCode;
      address.latitude = addressPosition.latitude;
      address.longitude = addressPosition.longitude;

      address = await this.addressRepository.save(address);
    } catch (exception) {
      throw new BadRequestError(exception.detail);
    }

    let user: User = new User();
    try {
      user.role = role;
      user.address = address;
      user.email = body.user.email;
      user.password = await this.cryptoHelper.hash(body.user.password);
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

    let addressPosition: GeoPosition;
    try {
      addressPosition = await this.locationHelper.getPosition(
        body.user.address.street,
        body.user.address.number,
        body.user.address.neighborhood,
        body.user.address.zipCode,
      );
    } catch (exception) {
      throw new BadRequestError(exception.message);
    }

    let address: Address = new Address();
    try {
      address.street = body.user.address.street;
      address.number = body.user.address.number;
      address.complement = body.user.address.complement;
      address.neighborhood = body.user.address.neighborhood;
      address.city = body.user.address.city;
      address.state = body.user.address.state;
      address.zipCode = body.user.address.zipCode;
      address.latitude = addressPosition.latitude;
      address.longitude = addressPosition.longitude;

      address = await this.addressRepository.save(address);
    } catch (exception) {
      throw new BadRequestError(exception.detail);
    }

    let companyAddressPosition: GeoPosition;
    try {
      companyAddressPosition = await this.locationHelper.getPosition(
        body.company.address.street,
        body.company.address.number,
        body.company.address.neighborhood,
        body.company.address.zipCode,
      );
    } catch (exception) {
      throw new BadRequestError(exception.message);
    }

    let companyAddress: Address = new Address();
    try {
      companyAddress.street = body.company.address.street;
      companyAddress.number = body.company.address.number;
      companyAddress.complement = body.company.address.complement;
      companyAddress.neighborhood = body.company.address.neighborhood;
      companyAddress.city = body.company.address.city;
      companyAddress.state = body.company.address.state;
      companyAddress.zipCode = body.company.address.zipCode;
      companyAddress.latitude = companyAddressPosition.latitude;
      companyAddress.longitude = companyAddressPosition.longitude;

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
      user.password = await this.cryptoHelper.hash(body.user.password);
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
  @OnUndefined(200)
  public async validate(
    @Param('id') id: number,
    @Param('hash') hash: string,
  ): Promise<void> {
    let user: User;
    try {
      user = await this.userRepository.findById(id);
    } catch (exception) {
      throw new UnauthorizedError();
    }

    if (
      user.status !== 'pending' ||
      !(await this.cryptoHelper.compare(
        Buffer.from(hash, 'base64').toString('ascii'),
        user.createdAt.toISOString(),
      ))
    ) {
      throw new UnauthorizedError();
    }

    user.status = 'enabled';
    await this.userRepository.save(user);
  }

  @Post('/password_reset')
  @OnUndefined(200)
  public async passwordReset(
    @Body({ required: true }) body: UserPasswordResetSchema,
  ): Promise<void> {
    const { email, document } = body;

    let user: User;
    try {
      user = await this.userRepository.findByEmail(email);
    } catch (exception) {
      throw new BadRequestError(exception.detail);
    }

    if (user.document !== document) {
      throw new BadRequestError();
    }

    const newPassword: string = await this.cryptoHelper.getRandomPassword();
    user.password = await this.cryptoHelper.hash(newPassword);

    try {
      await this.userRepository.save(user);
    } catch (exception) {
      throw new InternalServerError(exception.detail);
    }

    await this.mailHelper.sendNewPassword(user, newPassword);
  }
}
