import { Inject } from '@nestjs/common';

import { STRIPE_TOKEN } from '../constants';

export function InjectStripe() {
  return Inject(STRIPE_TOKEN);
}
