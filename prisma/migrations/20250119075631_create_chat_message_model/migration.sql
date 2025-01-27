-- CreateTable
CREATE TABLE "chat_messages" (
    "id" BIGINT NOT NULL,
    "room_id" BIGINT NOT NULL,
    "sender_id" BIGINT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "pk_chat_messages" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE
ON "chat_messages" FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();