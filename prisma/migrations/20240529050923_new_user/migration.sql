/*
  Warnings:

  - You are about to drop the column `password` on the `Users` table. All the data in the column will be lost.
  - Added the required column `isNewUser` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "password",
ADD COLUMN     "isNewUser" BOOLEAN NOT NULL;
