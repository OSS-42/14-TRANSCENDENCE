/*
  Warnings:

  - You are about to drop the `chatRoom` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "chatRoom";

-- CreateTable
CREATE TABLE "ChatRoom" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChatRoomMembers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ChatRoomModerators" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ChatRoomBannedUsers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_name_key" ON "ChatRoom"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_ChatRoomMembers_AB_unique" ON "_ChatRoomMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatRoomMembers_B_index" ON "_ChatRoomMembers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ChatRoomModerators_AB_unique" ON "_ChatRoomModerators"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatRoomModerators_B_index" ON "_ChatRoomModerators"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ChatRoomBannedUsers_AB_unique" ON "_ChatRoomBannedUsers"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatRoomBannedUsers_B_index" ON "_ChatRoomBannedUsers"("B");

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatRoomMembers" ADD CONSTRAINT "_ChatRoomMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatRoomMembers" ADD CONSTRAINT "_ChatRoomMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatRoomModerators" ADD CONSTRAINT "_ChatRoomModerators_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatRoomModerators" ADD CONSTRAINT "_ChatRoomModerators_B_fkey" FOREIGN KEY ("B") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatRoomBannedUsers" ADD CONSTRAINT "_ChatRoomBannedUsers_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatRoomBannedUsers" ADD CONSTRAINT "_ChatRoomBannedUsers_B_fkey" FOREIGN KEY ("B") REFERENCES "Utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
