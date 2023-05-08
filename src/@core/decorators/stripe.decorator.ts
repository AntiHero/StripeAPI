import { Inject } from '@nestjs/common';
import { STRIPE_TOKEN } from 'src/stripe/constants';

export const InjectStripe = () => Inject(STRIPE_TOKEN);
