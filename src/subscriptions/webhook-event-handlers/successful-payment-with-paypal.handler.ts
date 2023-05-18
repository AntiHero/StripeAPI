import { PayPalHttpClient } from '@paypal/checkout-server-sdk/lib/core/paypal_http_client';
import paypalSdk from '@paypal/checkout-server-sdk';
import { PaymentStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { Handler } from './handler';
import {
  PayPalEvent,
  PaypalPaymentResource,
} from '../types/stripe-event.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { CHECKOUT_ORDER_APPROVED } from 'src/@core/constants';
import { InjectPaypal } from 'src/@core/decorators/paypal.decorator';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';

@Injectable()
export class SuccessfulPaymentWithPaypal extends Handler {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly eventEmitter: EventEmitter,
    @InjectPaypal() private readonly paypal: PayPalHttpClient,
  ) {
    super();
  }

  protected async doHandle(
    event: PayPalEvent<PaypalPaymentResource>,
  ): Promise<boolean> {
    if (event.event_type === CHECKOUT_ORDER_APPROVED) {
      await this.prismaService.$transaction(async (tx) => {
        const request = new paypalSdk.orders.OrdersCaptureRequest(
          event.resource.id,
        );

        const response = await this.paypal.execute(request);
        console.log(`Capture: ${JSON.stringify(response.result)}`);
        const status = PaymentStatus.CONFIRMED;

        const paymentId =
          response.result?.purchase_units[0]?.payments?.captures[0]?.custom_id;

        if (response.result.status === 'COMPLETED') {
          await tx.payment.update({
            where: { id: paymentId },
            data: {
              status,
            },
          });

          this.eventEmitter.emit(`payment.${status.toLowerCase()}`, {
            paymentId,
            status,
            subscription: null,
          });
        } else {
          await tx.payment.update({
            where: { id: paymentId },
            data: {
              status: PaymentStatus.REJECTED,
            },
          });
        }
      });

      return false;
    }

    return true;
  }
}
