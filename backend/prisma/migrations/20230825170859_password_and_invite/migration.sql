/*
  Warnings:

  - Added the required column `invite` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "hash" TEXT,
ADD COLUMN     "invite" BOOLEAN NOT NULL;
