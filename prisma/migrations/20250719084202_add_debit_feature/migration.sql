/*
  Warnings:

  - You are about to drop the column `suplier_id` on the `debits` table. All the data in the column will be lost.
  - Added the required column `supplier_id` to the `debits` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "debits" DROP CONSTRAINT "debits_suplier_id_fkey";

-- AlterTable
ALTER TABLE "debits" DROP COLUMN "suplier_id",
ADD COLUMN     "supplier_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "debits" ADD CONSTRAINT "debits_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
