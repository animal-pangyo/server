/*
  Warnings:

  - You are about to alter the column `isRead` on the `chatmsg` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.
  - A unique constraint covering the columns `[user_id,block_user]` on the table `Block` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `chatmsg` MODIFY `img` INTEGER NULL,
    MODIFY `isRead` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Block_user_id_block_user_key` ON `Block`(`user_id`, `block_user`);
