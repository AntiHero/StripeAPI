import { registerAs } from '@nestjs/config';
import { PaypalEnvironment } from 'src/payment-systems/constants';

export const paypalConfig = registerAs('paypal', () => {
  const paypalDomain =
    process.env.PAYPAL_ENVIRONMENT === PaypalEnvironment.SANDBOX
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

  return {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    domain: paypalDomain,
  };
});
