/*
  Warnings:

  - Added the required column `secretId` to the `Utilisateur` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "is2FA" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is2FAValidated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "secretId" TEXT NOT NULL;
