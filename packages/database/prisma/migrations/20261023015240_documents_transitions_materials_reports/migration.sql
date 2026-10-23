-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('UPLOADED', 'VALIDATED', 'EXCEPTION');

-- CreateEnum
CREATE TYPE "TransitionKind" AS ENUM ('RENEWAL', 'TRANSFER');

-- CreateEnum
CREATE TYPE "TransitionStatus" AS ENUM ('REQUESTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MaterialItemKind" AS ENUM ('BOOK', 'MATERIAL', 'UNIFORM');

-- CreateEnum
CREATE TYPE "MaterialSource" AS ENUM ('EXTERNAL', 'SCHOOL', 'COURTESY');

-- CreateEnum
CREATE TYPE "MaterialOrderStatus" AS ENUM ('DRAFT', 'ORDERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MaterialPaymentStatus" AS ENUM ('NOT_APPLICABLE', 'PENDING', 'PAID');

-- CreateEnum
CREATE TYPE "MaterialDeliveryStatus" AS ENUM ('NOT_APPLICABLE', 'PENDING', 'DELIVERED');

-- DropForeignKey
ALTER TABLE "Classroom" DROP CONSTRAINT "Classroom_gradeId_fkey";

-- DropForeignKey
ALTER TABLE "Classroom" DROP CONSTRAINT "Classroom_schoolYearId_fkey";

-- DropForeignKey
ALTER TABLE "SchoolGrade" DROP CONSTRAINT "SchoolGrade_stageId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- CreateTable
CREATE TABLE "DocumentRequirement" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stageId" UUID,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentDocument" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "enrollmentId" UUID,
    "requirementId" UUID NOT NULL,
    "objectKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "exceptionReason" TEXT,
    "uploadedBy" UUID NOT NULL,
    "validatedBy" UUID,
    "validatedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "replacedAt" TIMESTAMPTZ(3),

    CONSTRAINT "StudentDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnrollmentCompletion" (
    "id" UUID NOT NULL,
    "enrollmentId" UUID NOT NULL,
    "complete" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,
    "actorId" UUID NOT NULL,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "EnrollmentCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnrollmentTransition" (
    "id" UUID NOT NULL,
    "operationKey" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "fromEnrollmentId" UUID,
    "targetSchoolYearId" UUID,
    "kind" "TransitionKind" NOT NULL,
    "status" "TransitionStatus" NOT NULL DEFAULT 'COMPLETED',
    "destination" TEXT,
    "acknowledgementAt" TIMESTAMPTZ(3),
    "documentsReleased" BOOLEAN NOT NULL DEFAULT false,
    "financialReview" TEXT NOT NULL,
    "actorId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnrollmentTransition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialKit" (
    "id" UUID NOT NULL,
    "schoolYearId" UUID NOT NULL,
    "gradeId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaterialKit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialItem" (
    "id" UUID NOT NULL,
    "kitId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "MaterialItemKind" NOT NULL,
    "source" "MaterialSource" NOT NULL,
    "optional" BOOLEAN NOT NULL DEFAULT true,
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "MaterialItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialOrder" (
    "id" UUID NOT NULL,
    "operationKey" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "enrollmentId" UUID,
    "kitId" UUID,
    "status" "MaterialOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "paymentStatus" "MaterialPaymentStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "deliveryStatus" "MaterialDeliveryStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "notes" TEXT,
    "actorId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "MaterialOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocumentRequirement_stageId_active_idx" ON "DocumentRequirement"("stageId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "StudentDocument_objectKey_key" ON "StudentDocument"("objectKey");

-- CreateIndex
CREATE INDEX "StudentDocument_studentId_status_idx" ON "StudentDocument"("studentId", "status");

-- CreateIndex
CREATE INDEX "StudentDocument_enrollmentId_requirementId_idx" ON "StudentDocument"("enrollmentId", "requirementId");

-- CreateIndex
CREATE UNIQUE INDEX "EnrollmentCompletion_enrollmentId_key" ON "EnrollmentCompletion"("enrollmentId");

-- CreateIndex
CREATE UNIQUE INDEX "EnrollmentTransition_operationKey_key" ON "EnrollmentTransition"("operationKey");

-- CreateIndex
CREATE INDEX "EnrollmentTransition_studentId_createdAt_idx" ON "EnrollmentTransition"("studentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialKit_schoolYearId_gradeId_name_key" ON "MaterialKit"("schoolYearId", "gradeId", "name");

-- CreateIndex
CREATE INDEX "MaterialItem_kitId_kind_idx" ON "MaterialItem"("kitId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialOrder_operationKey_key" ON "MaterialOrder"("operationKey");

-- CreateIndex
CREATE INDEX "MaterialOrder_studentId_status_idx" ON "MaterialOrder"("studentId", "status");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolGrade" ADD CONSTRAINT "SchoolGrade_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "SchoolStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "SchoolYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "SchoolGrade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentRequirement" ADD CONSTRAINT "DocumentRequirement_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "SchoolStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentDocument" ADD CONSTRAINT "StudentDocument_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentDocument" ADD CONSTRAINT "StudentDocument_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentDocument" ADD CONSTRAINT "StudentDocument_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "DocumentRequirement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrollmentCompletion" ADD CONSTRAINT "EnrollmentCompletion_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrollmentTransition" ADD CONSTRAINT "EnrollmentTransition_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrollmentTransition" ADD CONSTRAINT "EnrollmentTransition_fromEnrollmentId_fkey" FOREIGN KEY ("fromEnrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnrollmentTransition" ADD CONSTRAINT "EnrollmentTransition_targetSchoolYearId_fkey" FOREIGN KEY ("targetSchoolYearId") REFERENCES "SchoolYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialKit" ADD CONSTRAINT "MaterialKit_schoolYearId_fkey" FOREIGN KEY ("schoolYearId") REFERENCES "SchoolYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialKit" ADD CONSTRAINT "MaterialKit_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "SchoolGrade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialItem" ADD CONSTRAINT "MaterialItem_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "MaterialKit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialOrder" ADD CONSTRAINT "MaterialOrder_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialOrder" ADD CONSTRAINT "MaterialOrder_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialOrder" ADD CONSTRAINT "MaterialOrder_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "MaterialKit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
