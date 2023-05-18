/*
  Warnings:

  - A unique constraint covering the columns `[subscription]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "payments_subscription_key" ON "payments"("subscription");
