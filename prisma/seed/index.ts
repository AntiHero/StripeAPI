import { PrismaClient } from '@prisma/client';

import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function seed() {
  await prisma.user.deleteMany();
  await prisma.price.deleteMany();

  await prisma.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        email: 'eve@gmail.com',
        username: 'eve',
      },
    });

    await tx.price.createMany({
      data: [
        {
          period: 1,
          value: 10.0,
          currency: 'USD',
        },
        {
          period: 6,
          value: 50.0,
          currency: 'USD',
        },
        {
          period: 12,
          value: 100.0,
          currency: 'USD',
        },
      ],
    });

    const prices = await tx.price.findMany({});

    await tx.pricingPlan.createMany({
      data: [
        {
          priceId: prices[0].id,
          provider: 'STRIPE',
          paymentType: 'ONETIME',
          entityId: 'price_1N5xcwCiLuvOXDcQ6fpYRGZh',
        },
        {
          priceId: prices[1].id,
          provider: 'STRIPE',
          paymentType: 'ONETIME',
          entityId: 'price_1N5xcwCiLuvOXDcQdTK5VZ0T',
        },
        {
          priceId: prices[2].id,
          provider: 'STRIPE',
          paymentType: 'ONETIME',
          entityId: 'price_1N5xcwCiLuvOXDcQDGd9cVNN',
        },
        {
          priceId: prices[0].id,
          provider: 'STRIPE',
          paymentType: 'RECCURING',
          entityId: 'price_1N5xcwCiLuvOXDcQZa55KgSs',
        },
        {
          priceId: prices[1].id,
          provider: 'STRIPE',
          paymentType: 'RECCURING',
          entityId: 'price_1N5xcwCiLuvOXDcQFKwj2Oq6',
        },
        {
          priceId: prices[2].id,
          provider: 'STRIPE',
          paymentType: 'RECCURING',
          entityId: 'price_1N5xcwCiLuvOXDcQ9Zyf5Snl',
        },
        // PAYPAL
        {
          priceId: prices[0].id,
          provider: 'PAYPAL',
          paymentType: 'ONETIME',
          entityId: 'P-94S73988AG6344329MRPVXEI',
        },
        {
          priceId: prices[1].id,
          provider: 'PAYPAL',
          paymentType: 'ONETIME',
          entityId: 'P-9PK61989CS7583206MRPV6IQ',
        },
        {
          priceId: prices[2].id,
          provider: 'PAYPAL',
          paymentType: 'ONETIME',
          entityId: 'P-78740027FH535145YMRPWJBY',
        },
        {
          priceId: prices[0].id,
          provider: 'PAYPAL',
          paymentType: 'RECCURING',
          entityId: 'P-94S73988AG6344329MRPVXEI',
        },
        {
          priceId: prices[1].id,
          provider: 'PAYPAL',
          paymentType: 'RECCURING',
          entityId: 'P-9PK61989CS7583206MRPV6IQ',
        },
        {
          priceId: prices[2].id,
          provider: 'PAYPAL',
          paymentType: 'RECCURING',
          entityId: 'P-78740027FH535145YMRPWJBY',
        },
      ],
    });
  });
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(() => console.log('seeding completed'));
