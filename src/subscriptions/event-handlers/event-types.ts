import { PaymentStatus } from '@prisma/client';

export const PAYMENT_CONFIRMED_EVENT = `payment.${PaymentStatus.CONFIRMED.toLocaleLowerCase()}`;
export const PAYMENT_REJECTED_EVENT = `payment.${PaymentStatus.REJECTED.toLocaleLowerCase()}`;
