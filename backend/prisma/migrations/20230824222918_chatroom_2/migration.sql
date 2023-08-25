/*
  Warnings:

  - Added the required column `banId` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memberId` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modId` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "banId" INTEGER NOT NULL,
ADD COLUMN     "memberId" INTEGER NOT NULL,
ADD COLUMN     "modId" INTEGER NOT NULL;
