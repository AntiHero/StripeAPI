import { Provider } from '@nestjs/common';

import { WEBHOOK_EVENT_HANDLERS } from 'src/@core/constants';
import { SuccessfulSubscriptionWithStripe } from './successful-subscription-with-stripe.handler';
import { SuccessfulPaymentWithStripe } from './successful-payment-with-stripe.handler';
import { SuccessfulPaymentWithPaypal } from './successful-payment-with-paypal.handler';
import { SuccessfulSubscriptionWithPaypal } from './succesful-subscription-with-paypal.handler';

export const webhookEventHandlers = [
  SuccessfulPaymentWithStripe,
  SuccessfulPaymentWithPaypal,
  SuccessfulSubscriptionWithStripe,
  SuccessfulSubscriptionWithPaypal,
];

export const WebhookEventHandlersProvider: Provider = {
  provide: WEBHOOK_EVENT_HANDLERS,
  useFactory(...handlers) {
    return handlers;
  },
  inject: [...webhookEventHandlers],
};
