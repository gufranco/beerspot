import User from '../entities/User';

export interface HttpSignInResponseInterface {
  readonly user: User;
  readonly token: string;
}
