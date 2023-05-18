import { Controller, Get } from '@nestjs/common';
import Stripe from 'stripe';

import { InjectStripe } from './@core/decorators/stripe.decorator';

@Controller()
export class AppController {
  public constructor(@InjectStripe() private readonly stripe: Stripe) {}

  @Get('/')
  getRoot() {
    /** */
  }
}
