import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

import { PaymentSystem } from 'src/@core/constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { InjectStripe } from 'src/@core/decorators/stripe.decorator';
import { PaymentCommand, PaymentStrategy } from './base-payment.strategy';
import { PaymentException } from 'src/@core/exceptions/payment.exceptions';

export interface CheckoutMetadata extends Stripe.MetadataParam {
  userId: string;
  paymentId: string;
}

@Injectable()
export class StripePaymentStrategy extends PaymentStrategy {
  public constructor(
    @InjectStripe() private readonly stripe: Stripe,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  public name = PaymentSystem.STRIPE;

  public async execute(command: PaymentCommand) {
    try {
      return this.prisma.$transaction(async (tx) => {
        const { userId, price, renew } = command;
        const { id: priceId } = price;

        const pricingPlan = await tx.pricingPlan.findFirst({
          where: {
            priceId,
            provider: this.name,
            paymentType: renew ? 'RECCURING' : 'ONETIME',
          },
        });

        if (!pricingPlan) throw new PaymentException();

        const { id: planId, entityId } = pricingPlan;

        const payment = await tx.payment.create({
          data: {
            userId,
            planId,
            status: 'PENDING',
          },
        });

        const metadata: CheckoutMetadata = {
          userId,
          paymentId: payment.id,
        };

        const mode: Stripe.Checkout.Session.Mode = renew
          ? 'subscription'
          : 'payment';

        const session = await this.stripe.checkout.sessions.create({
          line_items: [
            {
              price: entityId,
              quantity: 1,
            },
          ],
          metadata,
          client_reference_id: payment.id,
          expires_at: Math.floor((Date.now() + 1_800_000) / 1000),
          mode,
          success_url: 'https://example.com?success=true',
          cancel_url: 'https://example.com?success=true',
          // success_url: this.baseConf.successUrl,
          // cancel_url: this.baseConf.cancelUrl,
        });

        return session.url;
      });
    } catch (error) {
      console.log(error);

      throw new PaymentException();
    }
  }
}
