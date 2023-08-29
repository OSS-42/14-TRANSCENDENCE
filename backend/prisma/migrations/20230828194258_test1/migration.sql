/*
  Warnings:

  - You are about to drop the column `gameLost` on the `Utilisateur` table. All the data in the column will be lost.
  - You are about to drop the column `gamesWon` on the `Utilisateur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Utilisateur" DROP COLUMN "gameLost",
DROP COLUMN "gamesWon";
