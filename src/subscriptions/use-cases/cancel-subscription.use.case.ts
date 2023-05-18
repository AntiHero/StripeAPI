import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentProvider } from '@prisma/client';
import { ConfigType } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import Stripe from 'stripe';

import { paypalConfig } from 'src/config/paypal.config';
import { InjectStripe } from 'src/@core/decorators/stripe.decorator';
import { InjectPaypal } from 'src/@core/decorators/paypal.decorator';
import { PayPalHttpClient } from '@paypal/checkout-server-sdk/lib/core/paypal_http_client';

export class CancelSubscriptionCommand {
  public constructor(
    public readonly subscriptionId: string | null,
    public readonly provider: PaymentProvider,
  ) {}
}

@CommandHandler(CancelSubscriptionCommand)
export class CancelSubscriptionHandler
  implements ICommandHandler<CancelSubscriptionCommand>
{
  public constructor(
    @InjectStripe() private readonly stripe: Stripe,
    @InjectPaypal() private readonly paypal: PayPalHttpClient,
    @Inject(paypalConfig.KEY)
    private paypalConf: ConfigType<typeof paypalConfig>,
  ) {}

  public async execute(command: CancelSubscriptionCommand): Promise<void> {
    const { subscriptionId, provider } = command;

    if (!subscriptionId) return;

    const reason = 'On demand';

    if (provider === PaymentProvider.STRIPE) {
      await this.stripe.subscriptions
        .del(subscriptionId, {
          cancellation_details: {
            comment: reason,
          },
        })
        .then(console.log, console.log);
    }

    if (provider === PaymentProvider.PAYPAL) {
      const token = await this.paypal.fetchAccessToken();

      await fetch(
        `${this.paypalConf.domain}/v1/billing/subscriptions/${subscriptionId}/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(<any>token)._accessToken}`,
          },
          body: JSON.stringify({
            reason,
          }),
        },
      ).then(console.log, console.log);
    }
  }
}
