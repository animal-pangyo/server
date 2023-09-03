/*
  Warnings:

  - Made the column `img` on table `chatmsg` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `chatmsg` MODIFY `img` VARCHAR(191) NOT NULL;
