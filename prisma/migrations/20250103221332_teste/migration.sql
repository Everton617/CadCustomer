/*
  Warnings:

  - A unique constraint covering the columns `[number]` on the table `Card` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_customerId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "Card_number_key" ON "Card"("number");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
