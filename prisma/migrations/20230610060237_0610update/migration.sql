-- DropForeignKey
ALTER TABLE `post` DROP FOREIGN KEY `Post_author_id_fkey`;

-- AlterTable
ALTER TABLE `post` MODIFY `author_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `User`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
