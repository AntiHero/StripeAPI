import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

import { InjectStripe } from 'src/@core/decorators/stripe.decorator';
import { InjectPaypal } from 'src/@core/decorators/paypal.decorator';
import { PayPalHttpClient } from '@paypal/checkout-server-sdk/lib/core/paypal_http_client';

@Injectable()
export class WebhookGuard implements CanActivate {
  public constructor(
    @InjectStripe() private readonly stripe: Stripe,
    @InjectPaypal() private readonly paypal: PayPalHttpClient,
    private readonly configService: ConfigService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      const signature = request.headers['stripe-signature'];

      const endpointSecret = <string>(
        this.configService.get<string>('stripe.webhookSecret')
      );

      console.log(
        this.stripe.webhooks.constructEvent(
          request.rawBody,
          signature,
          endpointSecret,
        ),
      );

      return true;
    } catch (e) {}

    try {
      const token = await this.paypal.fetchAccessToken();
      const headers = request.headers;

      const result = await fetch(
        'https://api-m.sandbox.paypal.com/v1/notifications/verify-webhook-signature',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(<any>token)._accessToken}`,
          },
          body: JSON.stringify({
            auth_algo: headers['paypal-auth-algo'],
            cert_url: headers['paypal-cert-url'],
            transmission_id: headers['paypal-transmission-id'],
            transmission_sig: headers['paypal-transmission-sig'],
            transmission_time: headers['paypal-transmission-time'],
            webhook_id: '69K25271NJ644033K',
            webhook_event: JSON.parse(JSON.stringify(request.body)),
          }),
        },
      )
        .then((res) => res.json())
        .then(({ verification_status }) =>
          verification_status === 'SUCCESS' ? true : false,
        );

      return result;
    } catch (e) {
      console.log(e);
    }

    return false;
  }
}
