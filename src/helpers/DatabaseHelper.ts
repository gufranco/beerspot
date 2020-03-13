import { useContainer, createConnection } from 'typeorm';
import { Container, Service, Inject } from 'typedi';
import EnvironmentHelper from './EnvironmentHelper';

@Service()
export default class DatabaseHelper {
  @Inject()
  private environmentHelper!: EnvironmentHelper;

  constructor() {
    useContainer(Container);
  }

  public async connect() {
    try {
      await createConnection({
        type: 'postgres',
        host: this.environmentHelper.getTypeormHost(),
        port: this.environmentHelper.getTypeormPort(),
        username: this.environmentHelper.getTypeormUsername(),
        password: this.environmentHelper.getTypeormPassword(),
        database: this.environmentHelper.getTypeormDatabase(),
        synchronize: true,
        logging: this.environmentHelper.getEnvironment() !== 'production',
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
