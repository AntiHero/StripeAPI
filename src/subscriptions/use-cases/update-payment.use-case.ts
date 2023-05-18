import { EventEmitter2 as EventEmitter } from '@nestjs/event-emitter';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Payment, PaymentStatus } from '@prisma/client';

import { PrismaService } from 'src/prisma/prisma.service';
import { InternalServerErrorException } from '@nestjs/common';
import { PaymentNotFoundException } from 'src/@core/exceptions/payment.exceptions';

type UpdatePaymentPayload =
  | { paymentId: string; subscription?: string; status?: PaymentStatus }
  | { subscription: string; paymentId?: string; status?: PaymentStatus };

export class UpdatePaymentCommand {
  public constructor(public readonly payload: UpdatePaymentPayload) {}
}

@CommandHandler(UpdatePaymentCommand)
export class UpdatePaymentHandler
  implements ICommandHandler<UpdatePaymentCommand>
{
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly eventEmitter: EventEmitter,
  ) {}

  public async execute(command: UpdatePaymentCommand) {
    const {
      payload: { paymentId: id, status, subscription },
    } = command;

    const where = id ? { id } : { subscription, status: PaymentStatus.PENDING };
    const data: Partial<Pick<Payment, 'subscription' | 'status'>> = {};

    subscription && (data.subscription = subscription);
    status && (data.status = status);

    try {
      const pendingPayment = await this.prismaService.payment.findFirst({
        where,
      });

      if (!pendingPayment) throw new PaymentNotFoundException();

      await this.prismaService.payment.update({
        where: { id: pendingPayment.id },
        data,
      });

      if (status) {
        this.eventEmitter.emit(`payment.${status.toLowerCase()}`, {
          paymentId: id || pendingPayment.id,
          status: status,
        });
      }
    } catch (error) {
      console.log(error);

      throw new InternalServerErrorException();
    }
  }
}
