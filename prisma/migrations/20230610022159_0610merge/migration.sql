/*
  Warnings:

  - Added the required column `detail_address` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `store` ADD COLUMN `detail_address` VARCHAR(191) NOT NULL;
