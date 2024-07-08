-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "lastPostDate" TIMESTAMP(3),
ADD COLUMN     "streakCount" INTEGER DEFAULT 0;
