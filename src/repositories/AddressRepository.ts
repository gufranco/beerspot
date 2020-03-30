import { EntityRepository, Repository } from 'typeorm';
import Address from '../entities/Address';
import { Service } from 'typedi';

@Service()
@EntityRepository(Address)
export default class AddressRepository extends Repository<Address> {
  findById(id: number) {
    return this.findOneOrFail({ id });
  }
}
