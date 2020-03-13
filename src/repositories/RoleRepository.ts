import { EntityRepository, Repository } from 'typeorm';
import Role, { RoleType } from '../entities/Role';

@EntityRepository(Role)
export default class RoleRepository extends Repository<Role> {
  findByType(type: RoleType) {
    return this.findOneOrFail({ type });
  }
}
