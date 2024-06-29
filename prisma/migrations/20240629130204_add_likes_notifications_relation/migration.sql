-- AlterTable
ALTER TABLE "Notifications" ADD COLUMN     "likeToCommentId" INTEGER,
ADD COLUMN     "likeToPostId" INTEGER;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_likeToPostId_fkey" FOREIGN KEY ("likeToPostId") REFERENCES "LikesToPosts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_likeToCommentId_fkey" FOREIGN KEY ("likeToCommentId") REFERENCES "LikesToComments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
