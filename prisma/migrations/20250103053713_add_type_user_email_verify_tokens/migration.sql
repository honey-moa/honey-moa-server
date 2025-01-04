
-- CreateEnum
CREATE TYPE "UserVerifyTokenTypeEnum" AS ENUM ('EMAIL', 'PASSWORD_CHANGE');


-- RenameTable
ALTER TABLE "user_email_verify_tokens" RENAME TO "user_verify_tokens";

-- RenameIndex
ALTER INDEX "pk_user_email_verify_tokens" RENAME TO "pk_user_verify_tokens";

-- DropIndex
DROP INDEX "uq_user_email_verify_tokens_user_id";

-- RenameIndex
ALTER INDEX "uq_user_email_verify_tokens_token" RENAME TO "uq_user_verify_tokens_token";

-- AddColumn
ALTER TABLE "user_verify_tokens" ADD COLUMN "type" "UserVerifyTokenTypeEnum" NOT NULL DEFAULT 'email';


-- DropDefault
ALTER TABLE "user_verify_tokens" ALTER COLUMN "type" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "user_verify_tokens_user_id_type_key" ON "user_verify_tokens"("user_id", "type");

-- RenameConstraint
ALTER TABLE "user_verify_tokens" RENAME CONSTRAINT "user_email_verify_tokens_user_id_fkey" TO "user_verify_tokens_user_id_fkey";

-- DropTrigger
DROP TRIGGER IF EXISTS update_user_email_verify_tokens_updated_at ON "user_email_verify_tokens";

-- CreateTrigger
CREATE TRIGGER update_user_verify_tokens_updated_at BEFORE UPDATE
ON "user_verify_tokens" FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();
