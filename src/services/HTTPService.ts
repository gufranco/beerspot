import express, { Application } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import { Container, Service, Inject } from 'typedi';
import { useExpressServer, useContainer } from 'routing-controllers';
import EnvironmentService from './EnvironmentService';

@Service()
export default class HTTPService {
  @Inject()
  private environmentService!: EnvironmentService;

  constructor() {
    useContainer(Container);
  }

  public async start() {
    const router: Application = this.getRouter();

    useExpressServer(router, {
      routePrefix: '/api',
      controllers: [`${__dirname}/../controllers/*.js`],
      cors: true,
      validation: true,
    });

    router.listen(this.environmentService.getHttpPort());
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
