import { NotFoundException } from '@nestjs/common';

export class SubscriptionNotFoundException extends NotFoundException {
  public constructor() {
    super({ cause: "Subscription with such price doesn't exist" });
  }
}
