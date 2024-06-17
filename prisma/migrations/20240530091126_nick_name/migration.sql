/*
  Warnings:

  - You are about to drop the column `isNewUser` on the `Users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nickName]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Users_userName_key";

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "isNewUser",
ADD COLUMN     "bio" VARCHAR(500),
ADD COLUMN     "nickName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Users_nickName_key" ON "Users"("nickName");
