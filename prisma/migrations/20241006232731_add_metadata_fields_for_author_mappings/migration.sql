/*
  Warnings:

  - Added the required column `updateAt` to the `story_authors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "story_authors" ADD COLUMN     "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL;
