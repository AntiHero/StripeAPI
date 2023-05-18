/*
  Warnings:

  - You are about to drop the column `subscriptionId` on the `payments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payments" DROP COLUMN "subscriptionId",
ADD COLUMN     "subscription" TEXT;
