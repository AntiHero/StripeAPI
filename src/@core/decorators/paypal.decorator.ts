import { Inject } from '@nestjs/common';
import { PAYPAL_TOKEN } from 'src/payment-systems/constants';

export const InjectPaypal = () => Inject(PAYPAL_TOKEN);
