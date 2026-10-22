CREATE TYPE "Role" AS ENUM ('DIRECTOR', 'SECRETARY', 'IT');
CREATE TABLE "User" (
  "id" UUID PRIMARY KEY, "name" TEXT NOT NULL, "email" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL, "role" "Role" NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "email_normalized" CHECK ("email" = lower(trim("email")))
);
CREATE TABLE "Session" (
  "id" UUID PRIMARY KEY, "userId" UUID NOT NULL REFERENCES "User"("id"),
  "refreshHash" TEXT NOT NULL UNIQUE, "familyId" UUID NOT NULL,
  "expiresAt" TIMESTAMPTZ(3) NOT NULL, "consumedAt" TIMESTAMPTZ(3), "revokedAt" TIMESTAMPTZ(3),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_familyId_idx" ON "Session"("familyId");
CREATE TABLE "AuditEvent" (
  "id" UUID PRIMARY KEY, "actorId" UUID, "action" TEXT NOT NULL,
  "targetId" UUID NOT NULL, "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "AuditEvent_createdAt_id_idx" ON "AuditEvent"("createdAt", "id");
