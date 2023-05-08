import { Controller, Get } from '@nestjs/common';
import Stripe from 'stripe';

import { InjectStripe } from './stripe/decorators/inject-stripe.decorator';

@Controller()
export class AppController {
  public constructor(@InjectStripe() private readonly stripe: Stripe) {}

  @Get('/')
  getRoot() {
    /** */
  }
}
