/*
  Warnings:

  - You are about to drop the column `identifier` on the `ServerToken` table. All the data in the column will be lost.
  - Added the required column `id` to the `ServerToken` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ServerToken" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "token" TEXT NOT NULL,
    "isExpires" BOOLEAN NOT NULL DEFAULT false,
    "serverId" TEXT NOT NULL,
    CONSTRAINT "ServerToken_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ServerToken" ("isExpires", "serverId", "token") SELECT "isExpires", "serverId", "token" FROM "ServerToken";
DROP TABLE "ServerToken";
ALTER TABLE "new_ServerToken" RENAME TO "ServerToken";
CREATE UNIQUE INDEX "ServerToken_token_key" ON "ServerToken"("token");
CREATE UNIQUE INDEX "ServerToken_token_id_key" ON "ServerToken"("token", "id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
