import jsonwebtoken from 'jsonwebtoken';
import { Service, Inject } from 'typedi';
import { JwtPayloadInterface } from '../interfaces/CryptoInterface';
import EnvironmentService from './EnvironmentService';

@Service()
export default class JwtService {
  @Inject()
  private environmentService!: EnvironmentService;

  public async createToken(payload: JwtPayloadInterface, expiresIn: string = '30 days'): Promise<string> {
    return new Promise((resolve, reject) => {
      jsonwebtoken.sign(
        payload,
        this.environmentService.getJwtPassword(),
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

  public async checkToken(token: string): Promise<JwtPayloadInterface> {
    return new Promise((resolve, reject) => {
      jsonwebtoken.verify(
        token,
        this.environmentService.getJwtPassword(),
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
