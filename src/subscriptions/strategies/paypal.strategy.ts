import { PayPalHttpClient } from '@paypal/checkout-server-sdk/lib/core/paypal_http_client';
import paypalCheckoutSdk from '@paypal/checkout-server-sdk';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';

import { baseConfig } from 'src/config/base.config';
import { PaymentSystem } from 'src/@core/constants';
import { paypalConfig } from 'src/config/paypal.config';
import { PrismaService } from 'src/prisma/prisma.service';
import { InjectPaypal } from 'src/@core/decorators/paypal.decorator';
import { PaymentCommand, PaymentStrategy } from './base-payment.strategy';
import { PaymentException } from 'src/@core/exceptions/payment.exceptions';

type CheckoutPaymentIntent = 'CAPTURE' | 'AUTHORIZE';

interface CreateOrderRuquestPayload {
  value: number;
  currency: 'USD';
  email: string;
  paymentId: string;
}

interface CreateSubscriptionRequestPayload {
  email: string;
  paymentId: string;
  entityId: string;
}

@Injectable()
export class PaypalPaymentStrategy extends PaymentStrategy {
  public constructor(
    private readonly prisma: PrismaService,
    @Inject(baseConfig.KEY) private baseConf: ConfigType<typeof baseConfig>,
    @Inject(paypalConfig.KEY)
    private paypalConf: ConfigType<typeof paypalConfig>,
    @InjectPaypal() private readonly paypal: PayPalHttpClient,
  ) {
    super();
  }

  public name = PaymentSystem.PAYPAL;

  public async execute(command: PaymentCommand) {
    const {
      price: { id: priceId, value, currency },
      userId,
      renew,
    } = command;

    const [user, pricingPlan] = await Promise.all([
      this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      }),

      this.prisma.pricingPlan.findFirst({
        where: {
          priceId,
          provider: this.name,
          paymentType: renew ? 'RECCURING' : 'ONETIME',
        },
      }),
    ]);

    if (!user || !pricingPlan) throw new PaymentException();

    const { email } = user;
    const { id: planId, entityId } = pricingPlan;

    try {
      return this.prisma.$transaction(async (tx) => {
        const payment = await tx.payment.create({
          data: {
            userId,
            planId,
            status: 'PENDING',
          },
        });

        const { id: paymentId } = payment;

        const result = renew
          ? await this.createSubscriptionRequest({
              email,
              entityId,
              paymentId,
            })
          : await this.createOrderRequest({
              currency,
              email,
              paymentId,
              value,
            });

        const redirectUrl: string | null =
          result.links.find(
            (link: Record<string, any>) => link.rel === 'approve',
          )?.href || null;

        return redirectUrl;
      });
    } catch (error) {
      console.log(error);

      throw new PaymentException();
    }
  }

  private createOrderRequest(payload: CreateOrderRuquestPayload) {
    const { value, currency, email, paymentId } = payload;

    const order = {
      intent: <CheckoutPaymentIntent>'CAPTURE',
      purchase_units: [
        {
          referenceId: paymentId,
          custom_id: paymentId,
          payee: {
            email_address: email,
          },
          items: [
            {
              name: 'BusinessPlan',
              quantity: '1',
              unit_amount: {
                currency_code: currency,
                value: String(value),
              },
            },
          ],
          amount: {
            currency_code: currency,
            value: String(value),
            breakdown: {
              item_total: {
                currency_code: currency,
                value: String(value),
              },
            },
          },
        },
      ],
      application_context: {
        // return_url: this.baseConf.successUrl,
        // return_url: this.baseConf.successUrl,
        return_url: 'https://example.com?success=true',
        cancel_url: 'https://example.com?cancel=true',
      },
    };

    const request = new paypalCheckoutSdk.orders.OrdersCreateRequest();

    request.headers['Prefer'] = 'return=representation';
    (request as any).headers['PayPal-Client-Metadata-Id'] = paymentId;

    request.requestBody(order as any);

    return this.paypal.execute(request).then((response) => response.result);
  }

  private async createSubscriptionRequest(
    payload: CreateSubscriptionRequestPayload,
  ) {
    const { paymentId, entityId, email } = payload;
    const token = await this.paypal.fetchAccessToken();

    return fetch(`${this.paypalConf.domain}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PayPal-Client-Metadata-Id': paymentId,
        Authorization: `Bearer ${(<any>token)._accessToken}`,
      },
      body: JSON.stringify({
        plan_id: entityId,
        custom_id: paymentId,
        subscriber: {
          email_address: email,
        },
        application_context: {
          brand_name: 'INCTAGRAM',
          locale: 'en-US',
          user_action: 'SUBSCRIBE_NOW',
          payment_method: {
            payer_selected: 'PAYPAL',
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
          },
          // return_url: this.baseConf.successUrl,
          // cancel_url: this.baseConf.cancelUrl,
          return_url: 'https://example.com?success=true',
          cancel_url: 'https://example.com?cancel=true',
        },
      }),
    }).then((res) => res.json());
  }
}
