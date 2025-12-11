/*
  Warnings:

  - A unique constraint covering the columns `[file_id]` on the table `posts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "file_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "posts_file_id_key" ON "posts"("file_id");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
