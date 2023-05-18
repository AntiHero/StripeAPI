/*
  Warnings:

  - A unique constraint covering the columns `[subscription]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "subscription" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_subscription_key" ON "subscriptions"("subscription");
