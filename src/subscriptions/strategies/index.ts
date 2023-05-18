import { Provider } from '@nestjs/common';

import { PAYMENT_STRATEGIES } from 'src/@core/constants';
import { PaymentStrategy } from './base-payment.strategy';
import { PaypalPaymentStrategy } from './paypal.strategy';
import { StripePaymentStrategy } from './stripe.strategy';

export const PaymentStrategiesProvider: Provider = {
  provide: PAYMENT_STRATEGIES,
  useFactory(
    paypalPaymentStrategy: PaymentStrategy,
    stripePaymentStrategy: PaymentStrategy,
  ) {
    return [paypalPaymentStrategy, stripePaymentStrategy];
  },
  inject: [PaypalPaymentStrategy, StripePaymentStrategy],
};
