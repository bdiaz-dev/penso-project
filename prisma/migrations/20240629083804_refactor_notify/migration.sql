/*
  Warnings:

  - You are about to drop the column `read` on the `Notifications` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'NEW_COMMENT';

-- AlterTable
ALTER TABLE "Notifications" DROP COLUMN "read";
