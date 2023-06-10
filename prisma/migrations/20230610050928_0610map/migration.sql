/*
  Warnings:

  - Added the required column `address_id` to the `Store` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `store` ADD COLUMN `address_id` VARCHAR(191) NOT NULL;
