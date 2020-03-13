import { EntityRepository, Repository } from 'typeorm';
import AdditionalAddress from '../entities/AdditionalAddress';

@EntityRepository(AdditionalAddress)
export default class AdditionalAddressRepository extends Repository<
  AdditionalAddress
> {
  findById(id: number) {
    return this.findOneOrFail({ id });
  }
}
