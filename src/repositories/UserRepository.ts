import { EntityRepository, Repository } from 'typeorm';
import User from '../entities/User';

@EntityRepository(User)
export default class UserRepository extends Repository<User> {
  findByEmail(email: string) {
    return this.findOneOrFail(
      { email },
      { relations: ['role', 'address', 'additionalAddresses', 'company'] },
    );
  }

  findById(id: number) {
    return this.findOneOrFail(
      { id },
      { relations: ['role', 'address', 'additionalAddresses', 'company'] },
    );
  }
}
