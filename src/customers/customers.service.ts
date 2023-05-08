import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

import { InjectStripe } from 'src/stripe/decorators/inject-stripe.decorator';

@Injectable()
export class CustomersService {
  public constructor(@InjectStripe() private readonly stripe: Stripe) {}

  public getProducts() {
    return this.stripe.products.list();
  }
}
