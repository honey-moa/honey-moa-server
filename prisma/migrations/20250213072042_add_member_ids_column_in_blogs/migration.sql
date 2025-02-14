-- AlterTable
ALTER TABLE "blogs" ADD COLUMN     "member_ids" BIGINT[];

-- member_ids 컬럼 업데이트:
UPDATE "blogs"
SET "member_ids" = ARRAY[c."requester_id", c."requested_id"]
FROM "user_connections" c
WHERE "blogs"."connection_id" = c."id";