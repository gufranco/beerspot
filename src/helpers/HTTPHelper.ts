import express, { Application } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import { Container, Service, Inject } from 'typedi';
import {
  useExpressServer,
  useContainer,
  Action,
  BadRequestError,
} from 'routing-controllers';
import { getCustomRepository } from 'typeorm';
import { JwtPayloadInterface } from '../interfaces/CryptoInterface';
import UserRepository from '../repositories/UserRepository';
import JwtHelper from './JwtHelper';
import EnvironmentHelper from './EnvironmentHelper';
import User from '../entities/User';

@Service()
export default class HTTPHelper {
  @Inject()
  private environmentHelper!: EnvironmentHelper;

  @Inject()
  private jwtHelper!: JwtHelper;

  constructor() {
    useContainer(Container);
  }

  public async start() {
    const router: Application = this.getRouter();
    const userRepository: UserRepository = getCustomRepository(UserRepository);

    useExpressServer(router, {
      routePrefix: '/api',
      controllers: [`${__dirname}/../controllers/*.js`],
      cors: true,
      classTransformer: true,
      validation: true,
      authorizationChecker: async (action: Action, roles: string[]) => {
        const token: string | undefined = action.request.headers.authorization;

        if (!token) {
          throw new BadRequestError();
        }

        try {
          const decryptedToken: JwtPayloadInterface = await this.jwtHelper.decryptToken(
            token,
          );
          const user: User = await userRepository.findById(
            decryptedToken.userId,
          );

          return roles.includes(user.role.type);
        } catch (exception) {
          throw new BadRequestError(exception.detail);
        }
      },
      currentUserChecker: async (action: Action) => {
        const token: string | undefined = action.request.headers.authorization;

        if (!token) {
          throw new BadRequestError();
        }

        try {
          const decryptedToken: JwtPayloadInterface = await this.jwtHelper.decryptToken(
            token,
          );
          return userRepository.findById(decryptedToken.userId);
        } catch (exception) {
          throw new BadRequestError(exception.detail);
        }
      },
    });

    router.listen(this.environmentHelper.getHttpPort());
  }

  private getRouter(): Application {
    const router: Application = express();

    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({ extended: true }));
    router.use('/', express.static(`${__dirname}/../../public`));
    router.use(morgan('combined'));
    router.use(helmet());

    return router;
  }
}
