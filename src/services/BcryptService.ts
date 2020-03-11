import bcryptjs from 'bcryptjs';
import { Service, Inject } from 'typedi';
import EnvironmentService from './EnvironmentService';

@Service()
export default class BcryptService {
  @Inject()
  private environmentService!: EnvironmentService;

  public async hash(value: string): Promise<string> {
    return bcryptjs.hash(value, this.environmentService.getBcryptRounds());
  }

  // eslint-disable-next-line class-methods-use-this
  public async compare(value: string, hashedValue: string): Promise<boolean> {
    return bcryptjs.compare(value, hashedValue);
  }
}
