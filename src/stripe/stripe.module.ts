import { DynamicModule, Module } from '@nestjs/common';

import { StripeAsyncOptions } from './interfaces';
import { StripeCoreModule } from './stripe.core.module';
import type { StripeOptions } from './interfaces/stripe-options.interface';

@Module({})
export class StripeModule {
  public static forRoot(options: StripeOptions): DynamicModule {
    return {
      module: StripeModule,
      imports: [StripeCoreModule.forRoot(options)],
    };
  }

  public static forRootAsync(options: StripeAsyncOptions): DynamicModule {
    return {
      module: StripeModule,
      imports: [StripeCoreModule.forRootAsync(options)],
    };
  }
}
