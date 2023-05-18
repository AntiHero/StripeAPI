import { Test, TestingModule } from '@nestjs/testing';
import { User, PrismaClient } from '@prisma/client';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';

import { baseConfig } from 'src/config/base.config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { stripeConfig } from 'src/config/stripe.config';
import { paypalConfig } from 'src/config/paypal.config';
import { SubscriptionsModule } from 'src/subscriptions/subscriptions.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let testUser: User | null;
  let onetime50$Price: string;
  const prisma = new PrismaClient();

  beforeAll(async () => {
    testUser = await prisma.user.findFirstOrThrow({
      where: {
        email: 'eve@gmail.com',
      },
    });

    await prisma.payment.deleteMany({
      where: {
        userId: testUser.id,
      },
    });

    onetime50$Price = (
      await prisma.price.findFirstOrThrow({
        where: {
          value: 50.0,
        },
      })
    ).id;

    if (!testUser) throw new Error("Test user doesn't exist");
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        SubscriptionsModule,
        ConfigModule.forRoot({
          isGlobal: true,
          load: [stripeConfig, paypalConfig, baseConfig],
        }),
        PrismaModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');

    await app.init();
  });

  it('/api/subscriptions/checkout-session (POST) should create payment with status pending', async () => {
    expect.assertions(2);

    return request(app.getHttpServer())
      .post('/api/subscriptions/checkout-session')
      .send({
        paymentSystem: 'PAYPAL',
        priceId: onetime50$Price,
        userId: testUser?.id,
        renew: false,
      })
      .expect(201)
      .then(async (response) => {
        expect(response.text).toMatch(
          /^https:\/\/www\.sandbox\.paypal\.com\/checkoutnow\?token=[A-Za-z0-9]+$/,
        );

        const payment = await prisma.payment.findFirstOrThrow({
          where: {
            userId: testUser?.id,
          },
        });

        expect(payment.status).toBe('PENDING');
      });
  });
});
