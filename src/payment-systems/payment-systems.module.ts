import { DynamicModule, Module } from '@nestjs/common';

import type {
  PaypalOptions,
  StripeOptions,
  PaypalAsyncOptions,
  StripeAsyncOptions,
} from './interfaces';
import { StripeCoreModule } from './stripe.core.module';
import { PaypalCoreModule } from './paypal.core.module';

@Module({})
export class PaymentSystemsModule {
  public static setupStripe(options: StripeOptions): DynamicModule {
    return {
      module: PaymentSystemsModule,
      imports: [StripeCoreModule.forRoot(options)],
    };
  }

  public static setupStripeAsync(options: StripeAsyncOptions): DynamicModule {
    return {
      module: PaymentSystemsModule,
      imports: [StripeCoreModule.forRootAsync(options)],
    };
  }

  public static setupPaypal(options: PaypalOptions): DynamicModule {
    return {
      module: PaymentSystemsModule,
      imports: [PaypalCoreModule.forRoot(options)],
    };
  }

  public static setupPaypalAsync(options: PaypalAsyncOptions): DynamicModule {
    return {
      module: PaymentSystemsModule,
      imports: [PaypalCoreModule.forRootAsync(options)],
    };
  }
}
