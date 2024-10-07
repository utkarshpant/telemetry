/*
  Warnings:

  - You are about to drop the column `views` on the `stories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "stories" DROP COLUMN "views",
ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "publishedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "story_views" (
    "storyId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "story_views_pkey" PRIMARY KEY ("storyId","date")
);

-- AddForeignKey
ALTER TABLE "story_views" ADD CONSTRAINT "story_views_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
