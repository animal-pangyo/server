/*
  Warnings:

  - Added the required column `isRead` to the `ChatMsg` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `chatmsg` ADD COLUMN `isRead` BOOLEAN NOT NULL;
