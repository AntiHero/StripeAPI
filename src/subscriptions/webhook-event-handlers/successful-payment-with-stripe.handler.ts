import { PaymentStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { Handler } from './handler';
import {
  StripeCheckoutSessionObject,
  StripeEvent,
} from '../types/stripe-event.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { CHECKOUT_SESSION_COMPLETED } from 'src/@core/constants';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';

@Injectable()
export class SuccessfulPaymentWithStripe extends Handler {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly eventEmitter: EventEmitter,
  ) {
    super();
  }

  protected async doHandle(
    event: StripeEvent<StripeCheckoutSessionObject>,
  ): Promise<boolean> {
    if (event.type === CHECKOUT_SESSION_COMPLETED) {
      const { paymentId } = event.data.object.metadata;
      const status = PaymentStatus.CONFIRMED;

      if (event.data.object.mode === 'payment') {
        await this.prismaService.payment.update({
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
        await this.prismaService.payment.update({
          where: { id: paymentId },
          data: {
            subscription: <string>event.data.object.subscription,
          },
        });
      }

      return false;
    }

    return true;
  }
}
