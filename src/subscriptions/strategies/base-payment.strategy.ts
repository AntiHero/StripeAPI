import { Price } from '@prisma/client';
import { PaymentSystem } from 'src/@core/constants';

export class PaymentCommand {
  public constructor(
    public readonly userId: string,
    public readonly price: Price,
    public readonly renew: boolean,
  ) {}
}

export abstract class PaymentStrategy<T = string | null> {
  public abstract name: PaymentSystem;

  public abstract execute(command: PaymentCommand): Promise<T>;
}
