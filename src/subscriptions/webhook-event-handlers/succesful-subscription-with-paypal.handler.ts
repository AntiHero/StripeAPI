import { PaymentStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { Handler } from './handler';
import {
  PayPalEvent,
  PaypalSubscriptionResource,
} from '../types/stripe-event.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { BILLING_SUBSCRIPTION_ACTIVATED } from 'src/@core/constants';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';

@Injectable()
export class SuccessfulSubscriptionWithPaypal extends Handler {
  public constructor(
    private readonly eventEmitter: EventEmitter,
    private readonly prismaService: PrismaService,
  ) {
    super();
  }

  protected async doHandle(
    event: PayPalEvent<PaypalSubscriptionResource>,
  ): Promise<boolean> {
    if (event.event_type === BILLING_SUBSCRIPTION_ACTIVATED) {
      const paymentId = event.resource.custom_id;
      const subscription = event.resource.id;

      await this.prismaService.$transaction(async (tx) => {
        const status = PaymentStatus.CONFIRMED;

        await tx.payment.update({
          where: { id: paymentId },
          data: {
            status,
            subscription,
          },
        });

        this.eventEmitter.emit(`payment.${status.toLowerCase()}`, {
          paymentId,
          status,
          subscription,
        });
      });

      return false;
    }

    return true;
  }
}
