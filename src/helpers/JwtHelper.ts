import jsonwebtoken from 'jsonwebtoken';
import { Service, Inject } from 'typedi';
import { JwtPayloadInterface } from '../interfaces/CryptoInterface';
import EnvironmentHelper from './EnvironmentHelper';

@Service()
export default class JwtHelper {
  @Inject()
  private environmentHelper!: EnvironmentHelper;

  public async createToken(
    payload: JwtPayloadInterface,
    expiresIn: string = '30 days',
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      jsonwebtoken.sign(
        payload,
        this.environmentHelper.getJwtPassword(),
        { expiresIn },
        (error: any, token: unknown) => {
          if (error) {
            reject(error);
          } else {
            resolve(<string>token);
          }
        },
      );
    });
  }

  public async decryptToken(token: string): Promise<JwtPayloadInterface> {
    return new Promise((resolve, reject) => {
      jsonwebtoken.verify(
        token,
        this.environmentHelper.getJwtPassword(),
        { algorithms: ['RS512'] },
        (error: any, jwtPayload: unknown) => {
          if (error) {
            reject(error);
          } else {
            resolve(<JwtPayloadInterface>jwtPayload);
          }
        },
      );
    });
  }
}
