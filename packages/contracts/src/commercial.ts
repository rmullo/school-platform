import { z } from 'zod';

const civilDate = z.iso.date();
const text = z.string().trim().min(2).max(500);
const cents = z.number().int().nonnegative().max(2_147_483_647);
const identity = { id: z.uuid(), version: z.number().int().positive() };

export const campaignStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);
export const campaignInputSchema = z.object({
  schoolYearId: z.uuid(), name: text.max(120), status: campaignStatusSchema,
  enrollmentStart: civilDate, enrollmentEnd: civilDate,
  disclosure: text, calendar: text, vacancyPolicy: text,
}).strict().refine(value => value.enrollmentStart <= value.enrollmentEnd, { message: 'O fim das inscrições deve ser igual ou posterior ao início.', path: ['enrollmentEnd'] });
export const contractInputSchema = z.object({
  campaignId: z.uuid(), version: z.number().int().positive(), title: text.max(160),
  totalAnnualCents: cents, initialInstallmentCents: cents,
  remainingInstallmentCents: cents, remainingInstallmentCount: z.number().int().positive().max(60),
  siblingDiscountBps: z.number().int().min(0).max(10000), punctualityDiscountCents: cents,
  materialCollectiveRequired: z.literal(false), terms: text.max(5000),
  validFrom: civilDate, validUntil: civilDate,
}).strict().refine(value => value.validFrom <= value.validUntil, { message: 'Validade final anterior à inicial.', path: ['validUntil'] })
  .refine(value => value.totalAnnualCents === value.initialInstallmentCents + value.remainingInstallmentCents * value.remainingInstallmentCount, { message: 'O total anual deve ser igual à parcela inicial mais as parcelas restantes.', path: ['totalAnnualCents'] });
export const campaignOfferInputSchema = z.object({ campaignId: z.uuid(), classroomId: z.uuid() }).strict();
export const commercialEditSchema = z.object({ version: z.number().int().positive(), reason: z.string().trim().min(5).max(300), data: z.unknown() }).strict();
export const campaignSchema = campaignInputSchema.extend(identity).extend({ schoolYear: z.object({ year: z.number().int() }) });
export const contractSchema = contractInputSchema.extend({ id: z.uuid() });
export const campaignOfferSchema = campaignOfferInputSchema.extend({ id: z.uuid(), version: z.number().int().positive(), classroom: z.object({ id: z.uuid(), name: text, capacity: z.number().int().positive(), occupied: z.number().int().nonnegative(), schoolYearId: z.uuid(), gradeId: z.uuid() }) });
export const commercialOverviewSchema = z.object({ campaigns: z.array(campaignSchema), contracts: z.array(contractSchema), offers: z.array(campaignOfferSchema), schoolYears: z.array(z.object({ id: z.uuid(), year: z.number().int() })), classrooms: z.array(z.object({ id: z.uuid(), name: text, capacity: z.number().int().positive(), occupied: z.number().int().nonnegative(), schoolYearId: z.uuid(), gradeId: z.uuid() })) });
export type CampaignStatus = z.infer<typeof campaignStatusSchema>;
export type CommercialOverview = z.infer<typeof commercialOverviewSchema>;
