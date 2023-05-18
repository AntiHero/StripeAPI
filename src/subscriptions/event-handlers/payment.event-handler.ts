import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { PAYMENT_CONFIRMED_EVENT } from './event-types';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserSubscriptionCommand } from '../use-cases/update-user-subscription.use-case';
import { CancelSubscriptionCommand } from '../use-cases/cancel-subscription.use.case';
import { PaymentComplitionException } from 'src/@core/exceptions/payment.exceptions';

@Injectable()
export class PaymentEventHandler {
  public constructor(
    private readonly commandBus: CommandBus,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent(PAYMENT_CONFIRMED_EVENT)
  public async handleEvent(payload: UpdateUserSubscriptionCommand) {
    const { paymentId, subscription = null } = payload;

    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId: (
          await this.prisma.payment.findUnique({
            where: {
              id: paymentId,
            },
          })
        )?.userId,
      },
    });

    if (existingSubscription) {
      const { userId, planId } = existingSubscription;

      const { provider } =
        (await this.prisma.pricingPlan.findUnique({
          where: {
            id: planId,
          },
        })) || {};

      if (!provider) throw new PaymentComplitionException();

      await this.commandBus.execute(
        new CancelSubscriptionCommand(
          existingSubscription.subscription,
          provider,
        ),
      );
    }

    await this.commandBus.execute(
      new UpdateUserSubscriptionCommand(paymentId, subscription),
    );
  }
}
