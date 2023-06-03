import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Invoice,
  Customer,
} from '../models';
import { InvoiceRepository } from '../repositories/invoice.repository';

export class InvoiceCustomerController {
  constructor(
    @repository(InvoiceRepository)
    public invoiceRepository: InvoiceRepository,
  ) { }

  @get('/invoices/{id}/customer', {
    responses: {
      '200': {
        description: 'Customer belonging to Invoice',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Customer)},
          },
        },
      },
    },
  })
  async getCustomer(
    @param.path.number('id') id: typeof Invoice.prototype.id,
  ): Promise<Customer> {
    return this.invoiceRepository.customer(id);
  }
}
