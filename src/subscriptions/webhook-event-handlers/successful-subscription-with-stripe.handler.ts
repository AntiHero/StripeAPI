import { PaymentStatus } from '@prisma/client';
import { Injectable } from '@nestjs/common';

import { Handler } from './handler';
import {
  StripeEvent,
  StripeInvoiceObject,
} from '../types/stripe-event.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { INVOICE_PAYMENT_SUCCEEDED } from 'src/@core/constants';
import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';
import { PaymentException } from 'src/@core/exceptions/payment.exceptions';
import { SubscriptionsQueryRepository } from 'src/subscriptions/repositories/subscriptions.query-repository';

@Injectable()
export class SuccessfulSubscriptionWithStripe extends Handler {
  public constructor(
    private readonly eventEmitter: EventEmitter,
    private readonly prismaService: PrismaService,
    private readonly subscriptionsQueryRepository: SubscriptionsQueryRepository,
  ) {
    super();
  }

  protected async doHandle(
    event: StripeEvent<StripeInvoiceObject>,
  ): Promise<boolean> {
    if (event.type === INVOICE_PAYMENT_SUCCEEDED) {
      const { subscription } = event.data.object;

      await this.prismaService.$transaction(async (tx) => {
        const pendingPayment =
          await this.subscriptionsQueryRepository.getPaymentByQuery({
            subscription,
            status: PaymentStatus.PENDING,
          });

        const confirmedStatus = PaymentStatus.CONFIRMED;

        const { userId, planId } = pendingPayment
          ? pendingPayment
          : (await this.subscriptionsQueryRepository.getPaymentByQuery({
              subscription,
              status: confirmedStatus,
            })) || {};

        if (!userId || !planId) throw new PaymentException();

        const { id: paymentId } = await tx.payment.upsert({
          where: {
            id: pendingPayment?.id,
          },
          create: {
            userId,
            planId,
            subscription,
            status: PaymentStatus.PENDING,
          },
          update: {
            status: confirmedStatus,
          },
          select: {
            id: true,
          },
        });

        this.eventEmitter.emit(`payment.${confirmedStatus.toLowerCase()}`, {
          paymentId,
          status: confirmedStatus,
          subscription,
        });
      });

      return false;
    }

    return true;
  }
}
