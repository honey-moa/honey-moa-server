-- CreateEnum
CREATE TYPE "UserConnectionStatusEnum" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "user_connections" (
    "id" BIGINT NOT NULL,
    "requested_id" BIGINT NOT NULL,
    "requester_id" BIGINT NOT NULL,
    "status" "UserConnectionStatusEnum" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "pk_user_connections" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_connections_requested_id" ON "user_connections"("requested_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_user_connections_requester_id" ON "user_connections"("requester_id");

-- AddForeignKey
ALTER TABLE "user_connections" ADD CONSTRAINT "user_connections_requested_id_fkey" FOREIGN KEY ("requested_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_connections" ADD CONSTRAINT "user_connections_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TRIGGER update_user_connections_updated_at BEFORE UPDATE
ON "user_connections" FOR EACH ROW EXECUTE PROCEDURE
update_updated_at_column();