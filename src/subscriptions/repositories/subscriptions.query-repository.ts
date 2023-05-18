import { Injectable } from '@nestjs/common';
import { Payment } from '@prisma/client';

import { DatabaseException } from 'src/@core/exceptions';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SubscriptionsQueryRepository {
  public constructor(private readonly prisma: PrismaService) {}

  public async getPriceById(id: string) {
    try {
      return this.prisma.price.findUnique({
        where: {
          id,
        },
      });
    } catch (error) {
      console.log(error);

      new DatabaseException();
    }
  }

  public async getPaymentByQuery(
    query: Partial<
      Pick<Payment, 'id' | 'planId' | 'userId' | 'subscription' | 'status'>
    >,
  ) {
    try {
      return this.prisma.payment.findFirst({
        where: {
          ...query,
        },
      });
    } catch (error) {
      console.log(error);

      new DatabaseException();
    }
  }
}
