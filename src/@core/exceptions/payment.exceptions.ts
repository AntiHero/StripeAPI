import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

export class PaymentException extends InternalServerErrorException {
  public constructor() {
    super({ cause: 'Payment can not be processed' });
  }
}

export class PaymentComplitionException extends InternalServerErrorException {
  public constructor() {
    super({ cause: 'Payment can not be completed' });
  }
}

export class PaymentNotFoundException extends NotFoundException {
  public constructor() {
    super({ cause: 'Payment not found' });
  }
}
