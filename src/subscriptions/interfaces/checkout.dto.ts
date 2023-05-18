import { PaymentSystem } from 'src/@core/constants';

export interface CheckoutDto {
  readonly paymentSystem: PaymentSystem;
  readonly priceId: string;
  readonly userId: string;
  readonly renew?: boolean;
}
