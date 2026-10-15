CREATE TABLE "FoundationState" (
  "key" TEXT NOT NULL,
  "token" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FoundationState_pkey" PRIMARY KEY ("key")
);
CREATE UNIQUE INDEX "FoundationState_token_key" ON "FoundationState"("token");
