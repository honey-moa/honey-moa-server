-- CreateIndex
CREATE INDEX "idx_attachments_path" ON "attachments"("path");

CREATE TRIGGER update_attachments_updated_at BEFORE UPDATE
ON "attachments" FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();