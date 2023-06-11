/*
  Warnings:

  - You are about to drop the column `address` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `birth` on the `user` table. All the data in the column will be lost.
  - Added the required column `address1` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address2` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `day` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `address`,
    DROP COLUMN `birth`,
    ADD COLUMN `address1` VARCHAR(191) NOT NULL,
    ADD COLUMN `address2` VARCHAR(191) NOT NULL,
    ADD COLUMN `day` VARCHAR(191) NOT NULL,
    ADD COLUMN `month` VARCHAR(191) NOT NULL,
    ADD COLUMN `year` VARCHAR(191) NOT NULL;
