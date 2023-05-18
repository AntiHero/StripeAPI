import { ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import {
  webhookEventHandlers,
  WebhookEventHandlersProvider,
} from './webhook-event-handlers';
import { PaymentStrategiesProvider } from './strategies';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { StripePaymentStrategy } from './strategies/stripe.strategy';
import { PaypalPaymentStrategy } from './strategies/paypal.strategy';
import { SubscriptionsController } from './subscriptions.controller';
import { UpdatePaymentHandler } from './use-cases/update-payment.use-case';
import { PaymentEventHandler } from './event-handlers/payment.event-handler';
import { CreatePaymentHandler } from './use-cases/start-payment-process.use-case';
import { PaymentSystemsModule } from 'src/payment-systems/payment-systems.module';
import { ProcessPaymentHandler } from './use-cases/verify-payment-process.use-case';
import { CancelSubscriptionHandler } from './use-cases/cancel-subscription.use.case';
import { SubscriptionsQueryRepository } from './repositories/subscriptions.query-repository';
import { UpdateUserSubscriptionHandler } from './use-cases/update-user-subscription.use-case';

const commandHandlers = [
  CreatePaymentHandler,
  UpdatePaymentHandler,
  ProcessPaymentHandler,
  CancelSubscriptionHandler,
  UpdateUserSubscriptionHandler,
];

@Module({
  imports: [
    CqrsModule,
    PaymentSystemsModule.setupStripeAsync({
      useFactory: (configService: ConfigService) => ({
        apiKey: <string>configService.get('stripe.apiKey'),
        apiVersion: '2022-11-15',
      }),
      inject: [ConfigService],
    }),
    PaymentSystemsModule.setupPaypalAsync({
      useFactory: (configService: ConfigService) => ({
        clientId: <string>configService.get('paypal.clientId'),
        clientSecret: <string>configService.get('paypal.clientSecret'),
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [SubscriptionsController],
  providers: [
    ...commandHandlers,
    ...webhookEventHandlers,
    PaypalPaymentStrategy,
    StripePaymentStrategy,
    PaymentEventHandler,
    PaymentStrategiesProvider,
    SubscriptionsQueryRepository,
    WebhookEventHandlersProvider,
  ],
})
export class SubscriptionsModule {}
