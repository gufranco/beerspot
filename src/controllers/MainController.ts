import { Service, Inject } from 'typedi';
import HTTPService from '../services/HTTPService';
import DatabaseService from '../services/DatabaseService';
import EnvironmentService from '../services/EnvironmentService';

@Service()
export default class MainController {
  @Inject()
  private environmentService!: EnvironmentService;

  @Inject()
  private databaseService!: DatabaseService;

  @Inject()
  private httpService!: HTTPService;

  public async run() {
    await this.environmentService.checkEnvironment();
    await this.databaseService.connect();
    await this.httpService.start();
  }
}
