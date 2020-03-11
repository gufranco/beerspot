import { Service } from 'typedi';

@Service()
export default class EnvironmentService {
  private environmentVars: Readonly<string[]> = [
    'NODE_ENV',
    'BCRYPT_ROUNDS',
    'HTTP_PORT',
    'TYPEORM_HOST',
    'TYPEORM_PORT',
    'TYPEORM_USERNAME',
    'TYPEORM_PASSWORD',
    'TYPEORM_DATABASE',
    'JWT_PASSWORD',
  ];

  public async checkEnvironment(): Promise<void> {
    const missingEnvironmentVars: string[] = this.environmentVars.filter(
      (variable) => !Object.prototype.hasOwnProperty.call(process.env, variable),
    );

    if (missingEnvironmentVars.length) {
      // eslint-disable-next-line no-console
      console.error(
        'Some environment variables are missing:',
        missingEnvironmentVars,
      );
    }
  }

  public getEnvironment(): string {
    return <string>process.env.NODE_ENV;
  }

  public getBcryptRounds(): number {
    return Number(process.env.BCRYPT_ROUNDS);
  }

  public getHttpPort(): number {
    return Number(process.env.HTTP_PORT);
  }

  public getTypeormHost(): string {
    return <string>process.env.TYPEORM_HOST;
  }

  public getTypeormPort(): number {
    return Number(process.env.TYPEORM_PORT);
  }

  public getTypeormUsername(): string {
    return <string>process.env.TYPEORM_USERNAME;
  }

  public getTypeormPassword(): string {
    return <string>process.env.TYPEORM_PASSWORD;
  }

  public getTypeormDatabase(): string {
    return `${process.env.TYPEORM_DATABASE}_${process.env.NODE_ENV}`;
  }

  public getJwtPassword(): string {
    return <string>process.env.JWT_PASSWORD;
  }
}
