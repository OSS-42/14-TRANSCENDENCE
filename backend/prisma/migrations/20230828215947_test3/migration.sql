-- CreateTable
CREATE TABLE "Banissement" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bannedUserId" INTEGER NOT NULL,
    "byUserId" INTEGER NOT NULL,

    CONSTRAINT "Banissement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Banissement" ADD CONSTRAINT "Banissement_bannedUserId_fkey" FOREIGN KEY ("bannedUserId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banissement" ADD CONSTRAINT "Banissement_byUserId_fkey" FOREIGN KEY ("byUserId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
