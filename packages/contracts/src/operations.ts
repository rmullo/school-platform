import { z } from 'zod';

const uuid = z.uuid();
const text = z.string().trim().min(2).max(500);
const civilDate = z.iso.date();

export const documentRequirementInputSchema = z.object({ name: text.max(160), description: z.string().trim().max(500).nullable(), stageId: uuid.nullable(), required: z.boolean(), active: z.boolean() }).strict();
export const documentUploadSchema = z.object({ requirementId: uuid, studentId: uuid, enrollmentId: uuid.nullable(), originalName: z.string().trim().min(1).max(180), contentType: z.enum(['application/pdf', 'image/jpeg', 'image/png']), contentBase64: z.string().min(1).max(5_000_000) }).strict();
export const documentReviewSchema = z.object({ status: z.enum(['VALIDATED', 'EXCEPTION']), reason: z.string().trim().min(5).max(500).nullable() }).strict().superRefine((value, context) => { if (value.status === 'EXCEPTION' && !value.reason) context.addIssue({ code: 'custom', path: ['reason'], message: 'A exceção exige justificativa.' }); });
export const completionSchema = z.object({ complete: z.boolean(), reason: z.string().trim().min(5).max(500).nullable() }).strict().superRefine((value, context) => { if (!value.complete && !value.reason) context.addIssue({ code: 'custom', path: ['reason'], message: 'Informe o motivo da pendência.' }); });

export const transitionSchema = z.object({ operationKey: uuid, studentId: uuid, fromEnrollmentId: uuid.nullable(), targetSchoolYearId: uuid.nullable(), kind: z.enum(['RENEWAL', 'TRANSFER']), destination: z.string().trim().max(240).nullable(), acknowledgementAt: z.iso.datetime().nullable(), documentsReleased: z.boolean(), financialReview: text.max(500) }).strict();

export const materialKitInputSchema = z.object({ schoolYearId: uuid, gradeId: uuid, name: text.max(160), active: z.boolean() }).strict();
export const materialItemInputSchema = z.object({ kitId: uuid, name: text.max(180), kind: z.enum(['BOOK', 'MATERIAL', 'UNIFORM']), source: z.enum(['EXTERNAL', 'SCHOOL', 'COURTESY']), optional: z.boolean(), priceCents: z.number().int().nonnegative().max(2_147_483_647) }).strict();
export const materialOrderInputSchema = z.object({ operationKey: uuid, studentId: uuid, enrollmentId: uuid.nullable(), kitId: uuid.nullable(), status: z.enum(['DRAFT', 'ORDERED', 'CANCELLED']), paymentStatus: z.enum(['NOT_APPLICABLE', 'PENDING', 'PAID']), deliveryStatus: z.enum(['NOT_APPLICABLE', 'PENDING', 'DELIVERED']), notes: z.string().trim().max(500).nullable() }).strict();

export const reportFilterSchema = z.object({ from: civilDate.nullable(), to: civilDate.nullable(), contractId: uuid.nullable() }).strict().refine(value => !value.from || !value.to || value.from <= value.to, { message: 'O período informado é inválido.', path: ['to'] });

export const operationsOverviewSchema = z.object({
  requirements: z.array(z.object({ id: uuid, name: text, description: z.string().nullable(), stageId: uuid.nullable(), required: z.boolean(), active: z.boolean(), version: z.number().int().positive() })),
  documents: z.array(z.object({ id: uuid, studentId: uuid, enrollmentId: uuid.nullable(), requirementId: uuid, originalName: text, contentType: text, sizeBytes: z.number().int().nonnegative(), status: z.enum(['UPLOADED', 'VALIDATED', 'EXCEPTION']), exceptionReason: z.string().nullable(), createdAt: z.iso.datetime(), validatedAt: z.iso.datetime().nullable() })),
  completions: z.array(z.object({ enrollmentId: uuid, complete: z.boolean(), reason: z.string().nullable(), updatedAt: z.iso.datetime() })),
  transitions: z.array(z.object({ id: uuid, operationKey: uuid, studentId: uuid, fromEnrollmentId: uuid.nullable(), targetSchoolYearId: uuid.nullable(), kind: z.enum(['RENEWAL', 'TRANSFER']), status: z.enum(['REQUESTED', 'COMPLETED', 'CANCELLED']), destination: z.string().nullable(), acknowledgementAt: z.iso.datetime().nullable(), documentsReleased: z.boolean(), financialReview: text, createdAt: z.iso.datetime() })),
  kits: z.array(z.object({ id: uuid, schoolYearId: uuid, gradeId: uuid, name: text, active: z.boolean(), items: z.array(z.object({ id: uuid, name: text, kind: z.enum(['BOOK', 'MATERIAL', 'UNIFORM']), source: z.enum(['EXTERNAL', 'SCHOOL', 'COURTESY']), optional: z.boolean(), priceCents: z.number().int().nonnegative() })) })),
  orders: z.array(z.object({ id: uuid, operationKey: uuid, studentId: uuid, enrollmentId: uuid.nullable(), kitId: uuid.nullable(), status: z.enum(['DRAFT', 'ORDERED', 'CANCELLED']), paymentStatus: z.enum(['NOT_APPLICABLE', 'PENDING', 'PAID']), deliveryStatus: z.enum(['NOT_APPLICABLE', 'PENDING', 'DELIVERED']), notes: z.string().nullable(), createdAt: z.iso.datetime(), updatedAt: z.iso.datetime() })),
});
export type OperationsOverview = z.infer<typeof operationsOverviewSchema>;
export type ReportFilter = z.infer<typeof reportFilterSchema>;

export const reportSchema = z.object({ filter: reportFilterSchema, receipts: z.object({ count: z.number().int().nonnegative(), postedCents: z.number().int().nonnegative(), reversedCents: z.number().int().nonnegative() }), obligations: z.object({ openCents: z.number().int().nonnegative(), settledCents: z.number().int().nonnegative(), overdueCount: z.number().int().nonnegative() }), credits: z.object({ availableCents: z.number().int().nonnegative() }), refunds: z.object({ count: z.number().int().nonnegative(), executedCents: z.number().int().nonnegative() }), generatedAt: z.iso.datetime() });
export type Report = z.infer<typeof reportSchema>;

