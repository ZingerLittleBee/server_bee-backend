-- CreateTable
CREATE TABLE "ServerToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "isExpires" BOOLEAN NOT NULL DEFAULT false,
    "serverId" TEXT NOT NULL,
    CONSTRAINT "ServerToken_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ServerToken_token_key" ON "ServerToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ServerToken_identifier_token_key" ON "ServerToken"("identifier", "token");
