/*
  Warnings:

  - A unique constraint covering the columns `[requested_id,requester_id]` on the table `user_connections` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "uq_user_connections_requested_id";

-- DropIndex
DROP INDEX "uq_user_connections_requester_id";

-- CreateIndex
CREATE UNIQUE INDEX "user_connections_requested_id_requester_id_key" ON "user_connections"("requested_id", "requester_id");
