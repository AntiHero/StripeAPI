import { Inject } from '@nestjs/common';
import { STRIPE_TOKEN } from 'src/payment-systems/constants';

export const InjectStripe = () => Inject(STRIPE_TOKEN);
