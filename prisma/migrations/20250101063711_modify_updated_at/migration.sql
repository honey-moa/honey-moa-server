CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."updated_at" = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE
ON "users" FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();

CREATE TRIGGER update_user_email_verify_tokens_updated_at BEFORE UPDATE
ON "user_email_verify_tokens" FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE
ON "posts" FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();