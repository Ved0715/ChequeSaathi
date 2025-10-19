/*
  Warnings:

  - A unique constraint covering the columns `[customerId,chequeNumber]` on the table `cheques` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."cheques_chequeNumber_key";

-- CreateIndex
CREATE UNIQUE INDEX "cheques_customerId_chequeNumber_key" ON "cheques"("customerId", "chequeNumber");
