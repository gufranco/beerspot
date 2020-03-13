import { EntityRepository, Repository } from 'typeorm';
import Company from '../entities/Company';

@EntityRepository(Company)
export default class CompanyRepository extends Repository<Company> {
  findById(id: number) {
    return this.findOneOrFail({ id });
  }
}
