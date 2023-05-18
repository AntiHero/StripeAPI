import { registerAs } from '@nestjs/config';

export const baseConfig = registerAs('subscriptions', () => {
  const frontendDomain =
    process.env.MODE === 'production'
      ? process.env.FRONTEND_DOMAIN
      : process.env.FRONTEND_LOCAL_DOMAIN;

  return {
    successUrl: `${frontendDomain}/?success=true`,
    cancelUrl: `${frontendDomain}/?cancel=true`,
  };
});
