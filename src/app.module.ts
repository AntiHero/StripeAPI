import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { stripeConfig } from './config/stripe.config';
import { PrismaModule } from './prisma/prisma.module';
import { StripeModule } from './stripe/stripe.module';
import { CustomersModule } from './customers/customers.module';

@Module({
  imports: [
    PrismaModule,
    StripeModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return {
          apiKey: <string>configService.get<string>('stripe.apiKey'),
          apiVersion: '2022-11-15',
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [stripeConfig],
    }),
    CustomersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
