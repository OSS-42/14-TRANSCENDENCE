/*
  Warnings:

  - You are about to drop the column `bannedUserId` on the `Banissement` table. All the data in the column will be lost.
  - Added the required column `blockedUserId` to the `Banissement` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Banissement" DROP CONSTRAINT "Banissement_bannedUserId_fkey";

-- AlterTable
ALTER TABLE "Banissement" DROP COLUMN "bannedUserId",
ADD COLUMN     "blockedUserId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Banissement" ADD CONSTRAINT "Banissement_blockedUserId_fkey" FOREIGN KEY ("blockedUserId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
