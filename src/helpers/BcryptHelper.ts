import bcryptjs from 'bcryptjs';
import { Service, Inject } from 'typedi';
import EnvironmentHelper from './EnvironmentHelper';

@Service()
export default class BcryptHelper {
  @Inject()
  private environmentHelper!: EnvironmentHelper;

  public async hash(value: string): Promise<string> {
    return bcryptjs.hash(value, this.environmentHelper.getBcryptRounds());
  }

  // eslint-disable-next-line class-methods-use-this
  public async compare(value: string, hashedValue: string): Promise<boolean> {
    return bcryptjs.compare(value, hashedValue);
  }
}
