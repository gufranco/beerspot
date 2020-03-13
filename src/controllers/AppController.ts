import { Service, Inject } from 'typedi';
import HTTPHelper from '../helpers/HTTPHelper';
import DatabaseHelper from '../helpers/DatabaseHelper';
import EnvironmentHelper from '../helpers/EnvironmentHelper';

@Service()
export default class AppController {
  @Inject()
  private environmentHelper!: EnvironmentHelper;

  @Inject()
  private databaseHelper!: DatabaseHelper;

  @Inject()
  private httpHelper!: HTTPHelper;

  public async run() {
    await this.environmentHelper.checkEnvironment();
    await this.databaseHelper.connect();
    await this.httpHelper.start();
  }
}
