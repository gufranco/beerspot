import bcryptjs from 'bcryptjs';
import { Service, Inject } from 'typedi';
import { v4 as uuidv4 } from 'uuid';
import EnvironmentHelper from './EnvironmentHelper';

@Service()
export default class CryptoHelper {
  @Inject()
  private environmentHelper!: EnvironmentHelper;

  public async hash(value: string): Promise<string> {
    return bcryptjs.hash(value, this.environmentHelper.getBcryptRounds());
  }

  public async compare(value: string, hashedValue: string): Promise<boolean> {
    return bcryptjs.compare(value, hashedValue);
  }

  public async getRandomPassword(): Promise<string> {
    return uuidv4();
  }
}
