import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InternalServerErrorException } from '@nestjs/common';
import { Price } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { calculateExpirationDate } from '../utils/calculate-expiration-date';
import { PaymentNotFoundException } from 'src/@core/exceptions/payment.exceptions';

export class UpdateUserSubscriptionCommand {
  public constructor(
    public readonly paymentId: string,
    public readonly subscription: string | null,
  ) {}
}

@CommandHandler(UpdateUserSubscriptionCommand)
export class UpdateUserSubscriptionHandler
  implements ICommandHandler<UpdateUserSubscriptionCommand>
{
  public constructor(private readonly prismaService: PrismaService) {}

  public async execute(command: UpdateUserSubscriptionCommand): Promise<void> {
    const { paymentId, subscription } = command;
    console.log(paymentId, 'paymentId');

    try {
      const payment = await this.prismaService.payment.findUnique({
        where: {
          id: paymentId,
        },
      });

      if (!payment) throw new PaymentNotFoundException();

      const priceInfo = <Price>await this.prismaService.price.findFirst({
        where: {
          providerPrice: {
            some: {
              id: payment.planId,
              paymentType: (
                await this.prismaService.pricingPlan.findUnique({
                  where: {
                    id: payment.planId,
                  },
                })
              )?.paymentType,
            },
          },
        },
      });

      const { expirationDate } =
        (await this.prismaService.subscription.findUnique({
          where: {
            userId: payment.userId,
          },
        })) || {};

      const { period } = priceInfo;

      const newExpirationDate = calculateExpirationDate(
        expirationDate && expirationDate > new Date()
          ? expirationDate
          : new Date(),
        period,
      );

      const { userId, planId } = payment;

      await this.prismaService.$transaction(async (tx) => {
        await Promise.all([
          tx.subscription.upsert({
            where: {
              userId: payment.userId,
            },
            create: {
              expirationDate: newExpirationDate,
              status: 'ACTIVE',
              planId,
              userId,
              subscription,
            },
            update: {
              expirationDate: newExpirationDate,
              planId,
              subscription,
            },
          }),
          tx.payment.update({
            where: {
              id: paymentId,
            },
            data: {
              expirationDate: newExpirationDate,
            },
          }),
        ]);
      });
    } catch (error) {
      console.log(error);

      // return null;
      throw new InternalServerErrorException();
    }
  }
}
