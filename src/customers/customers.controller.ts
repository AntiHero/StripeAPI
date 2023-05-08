import { Controller, Get } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  public constructor(private readonly customersService: CustomersService) {}

  @Get('/products')
  async getProducts() {
    return this.customersService.getProducts();
  }
}
