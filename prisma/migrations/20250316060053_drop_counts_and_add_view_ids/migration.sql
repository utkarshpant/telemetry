/*
  Warnings:

  - You are about to drop the column `count` on the `story_views` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "story_views" DROP COLUMN "count",
ADD COLUMN     "id" SERIAL NOT NULL;
