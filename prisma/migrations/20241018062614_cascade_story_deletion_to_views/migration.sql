-- DropForeignKey
ALTER TABLE "story_views" DROP CONSTRAINT "story_views_storyId_fkey";

-- AddForeignKey
ALTER TABLE "story_views" ADD CONSTRAINT "story_views_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
