import { useContainer, createConnection } from 'typeorm';
import { Container, Service, Inject } from 'typedi';
import EnvironmentService from './EnvironmentService';

@Service()
export default class DatabaseService {
  @Inject()
  private environmentService!: EnvironmentService;

  constructor() {
    useContainer(Container);
  }

  public async connect() {
    try {
      await createConnection({
        type: 'postgres',
        host: this.environmentService.getTypeormHost(),
        port: this.environmentService.getTypeormPort(),
        username: this.environmentService.getTypeormUsername(),
        password: this.environmentService.getTypeormPassword(),
        database: this.environmentService.getTypeormDatabase(),
        synchronize: true,
        logging: this.environmentService.getEnvironment() !== 'production',
        entities: [`${__dirname}/../entities/*.js`],
        migrations: [`${__dirname}/../migrations/*.js`],
        subscribers: [`${__dirname}/../subscribers/*.js`],
      });
    } catch (exception) {
      // eslint-disable-next-line no-console
      console.error(exception);
    }
  }
}
