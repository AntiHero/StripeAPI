import { PrismaClient } from '@prisma/client';

import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function seed() {
  await prisma.user.deleteMany();
  await prisma.subscriptionPrice.deleteMany();

  await prisma.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        email: 'eve@gmail.com',
        username: 'eve',
      },
    });

    await tx.subscriptionPrice.createMany({
      data: [
        {
          currency: 'USD',
          price: 10,
          priceId: 'price_1N5xcwCiLuvOXDcQ6fpYRGZh',
          productId: 'prod_Nrh0od8Djiubbw',
          type: 'ONETIME',
          name: 'MONTH',
          period: 1,
        },
        {
          currency: 'USD',
          price: 50,
          priceId: 'price_1N5xcwCiLuvOXDcQdTK5VZ0T',
          productId: 'prod_Nrh0od8Djiubbw',
          type: 'ONETIME',
          name: 'SIXMONTHS',
          period: 6,
        },
        {
          currency: 'USD',
          price: 100,
          priceId: 'price_1N5xcwCiLuvOXDcQDGd9cVNN',
          productId: 'prod_Nrh0od8Djiubbw',
          type: 'ONETIME',
          name: 'YEAR',
          period: 12,
        },
        {
          currency: 'USD',
          price: 10,
          priceId: 'price_1N5xcwCiLuvOXDcQZa55KgSs',
          productId: 'prod_Nrh0od8Djiubbw',
          type: 'RECCURING',
          name: 'MONTH',
          period: 1,
        },
        {
          currency: 'USD',
          price: 50,
          priceId: 'price_1N5xcwCiLuvOXDcQFKwj2Oq6',
          productId: 'prod_Nrh0od8Djiubbw',
          type: 'RECCURING',
          name: 'SIXMONTHS',
          period: 6,
        },
        {
          currency: 'USD',
          price: 100,
          priceId: 'price_1N5xcwCiLuvOXDcQ9Zyf5Snl',
          productId: 'prod_Nrh0od8Djiubbw',
          type: 'RECCURING',
          name: 'YEAR',
          period: 12,
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
  });
