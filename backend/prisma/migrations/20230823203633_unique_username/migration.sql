/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `Utilisateur` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_username_key" ON "Utilisateur"("username");
