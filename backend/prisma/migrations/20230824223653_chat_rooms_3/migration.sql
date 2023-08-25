/*
  Warnings:

  - You are about to drop the column `banId` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the column `memberId` on the `ChatRoom` table. All the data in the column will be lost.
  - You are about to drop the column `modId` on the `ChatRoom` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatRoom" DROP COLUMN "banId",
DROP COLUMN "memberId",
DROP COLUMN "modId";
