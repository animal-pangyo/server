-- DropForeignKey
ALTER TABLE `block` DROP FOREIGN KEY `Block_block_user_fkey`;

-- DropForeignKey
ALTER TABLE `block` DROP FOREIGN KEY `Block_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `chatmsg` DROP FOREIGN KEY `ChatMsg_author_id_fkey`;

-- DropForeignKey
ALTER TABLE `chatroom` DROP FOREIGN KEY `ChatRoom_user_id1_fkey`;

-- DropForeignKey
ALTER TABLE `chatroom` DROP FOREIGN KEY `ChatRoom_user_id2_fkey`;

-- AlterTable
ALTER TABLE `block` MODIFY `user_id` VARCHAR(191) NOT NULL,
    MODIFY `block_user` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `chatmsg` MODIFY `author_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `chatroom` MODIFY `user_id1` VARCHAR(191) NOT NULL,
    MODIFY `user_id2` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Block` ADD CONSTRAINT `Block_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Block` ADD CONSTRAINT `Block_block_user_fkey` FOREIGN KEY (`block_user`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatRoom` ADD CONSTRAINT `ChatRoom_user_id1_fkey` FOREIGN KEY (`user_id1`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatRoom` ADD CONSTRAINT `ChatRoom_user_id2_fkey` FOREIGN KEY (`user_id2`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChatMsg` ADD CONSTRAINT `ChatMsg_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
