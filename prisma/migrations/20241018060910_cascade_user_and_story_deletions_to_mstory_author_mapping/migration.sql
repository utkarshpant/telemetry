-- DropForeignKey
ALTER TABLE "story_authors" DROP CONSTRAINT "story_authors_storyId_fkey";

-- DropForeignKey
ALTER TABLE "story_authors" DROP CONSTRAINT "story_authors_userId_fkey";

-- AddForeignKey
ALTER TABLE "story_authors" ADD CONSTRAINT "story_authors_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_authors" ADD CONSTRAINT "story_authors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
