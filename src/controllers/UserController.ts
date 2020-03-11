import { getCustomRepository } from 'typeorm';
import { Service, Inject } from 'typedi';
import {
  JsonController, Post, Body, UnauthorizedError, BadRequestError,
} from 'routing-controllers';
import RoleRepository from '../repositories/RoleRepository';
import UserRepository from '../repositories/UserRepository';
import User from '../entities/User';
import { HttpSignInResponseInterface } from '../interfaces/HttpInterface';
import SignInPayload from '../validators/SignInPayload';
import SignUpPayload from '../validators/SignUpPayload';
import BcryptService from '../services/BcryptService';
import JwtService from '../services/JwtService';
@Service()
@JsonController('/users')
export default class UserController {
  @Inject()
  private bcryptService!: BcryptService;

  @Inject()
  private jwtService!: JwtService;

  private userRepository: UserRepository = getCustomRepository(UserRepository);

  private roleRepository: RoleRepository = getCustomRepository(RoleRepository);

  @Post('/sign_in')
  public async signIn(
    @Body({ required: true, validate: true }) signInPayload: SignInPayload,
  ): Promise<HttpSignInResponseInterface | undefined> {
    const { email, password } = signInPayload;
    const user: User | undefined = await this.userRepository.findByEmail(email);

    if (
      !user
      || user.status !== 'enabled'
      || !(await this.bcryptService.compare(password, user.password))
    ) {
      throw new UnauthorizedError();
    }

    return {
      userId: user.id,
      role: user.role.type,
      token: await this.jwtService.createToken({ userId: user.id }),
    };
  }

  @Post('/sign_up')
  public async signUp(
    @Body({ required: true, validate: true }) signUpPayload: SignUpPayload,
  ): Promise<User> {
    const {
      email,
      password,
      firstName,
      lastName,
      birthDate,
      phone,
      type,
    } = signUpPayload;

    const role = await this.roleRepository.findByType(type);

    if (!role) {
      throw new BadRequestError();
    }

    let user = new User();
    user.role = role;
    user.email = email;
    user.password = await this.bcryptService.hash(password);
    user.status = 'peding';
    user.firstName = firstName;
    user.lastName = lastName;
    user.birthDate = new Date(birthDate);
    user.phone = phone;

    try {
      user = await this.userRepository.save(user);
      delete user.password;

      return user;
    } catch (exception) {
      throw new BadRequestError(exception.detail);
    }
  }
}
