-- DropIndex
DROP INDEX "users_email_login_type_key";

-- CreateIndex
CREATE INDEX "idx_user_email_login_type" ON "users"("email", "login_type");
