import { EntityRepository, Repository } from 'typeorm';
import User from '../entities/User';

@EntityRepository(User)
export default class UserRepository extends Repository<User> {
  findByEmail(email: string) {
    return this.findOne({ email }, { relations: ['role'] });
  }
}
