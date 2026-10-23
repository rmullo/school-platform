import { z } from 'zod';

const uuid = z.uuid();
const name = z.string().trim().min(2).max(300);

export const enrollmentInputSchema = z.object({
  studentId: uuid,
  classroomId: uuid,
  campaignId: uuid,
  contractId: uuid,
  financialResponsibleId: uuid,
  pendingItems: z.array(z.string().trim().min(2).max(160)).max(20),
  entryMonth: z.number().int().min(1).max(12).optional(),
}).strict();

export const enrollmentEditSchema = z.object({
  version: z.number().int().positive(),
  reason: z.string().trim().min(5).max(300),
  data: enrollmentInputSchema,
}).strict();

export const enrollmentConfirmationSchema = z.object({
  draftVersion: z.number().int().positive(),
  operationKey: uuid,
  settlement: z.enum(['PAYMENT', 'WAIVER', 'NEGOTIATION']),
  amountCents: z.number().int().nonnegative(),
  method: z.enum(['MANUAL']).optional(),
  reason: z.string().trim().min(5).max(500).optional(),
}).strict().superRefine((value, context) => {
  if (value.settlement === 'PAYMENT' && value.method !== 'MANUAL') context.addIssue({ code: 'custom', path: ['method'], message: 'Informe o recebimento manual.' });
  if (value.settlement !== 'PAYMENT' && !value.reason) context.addIssue({ code: 'custom', path: ['reason'], message: 'Informe o motivo da dispensa ou negociação.' });
});

const cents = z.number().int().positive();
export const paymentAllocationInputSchema = z.object({ obligationId: uuid, amountCents: cents }).strict();
export const paymentInputSchema = z.object({ operationKey: uuid, amountCents: cents, method: z.literal('MANUAL'), reason: z.string().trim().max(500).optional(), allocations: z.array(paymentAllocationInputSchema).min(1).max(30) }).strict().superRefine((value, context) => {
  const ids = value.allocations.map(item => item.obligationId); if (new Set(ids).size !== ids.length) context.addIssue({ code: 'custom', path: ['allocations'], message: 'A obrigação não pode ser repetida.' });
  if (value.allocations.reduce((total, item) => total + item.amountCents, 0) > value.amountCents) context.addIssue({ code: 'custom', path: ['allocations'], message: 'A alocação não pode superar o valor recebido.' });
});
export const paymentReversalSchema = z.object({ operationKey: uuid, reason: z.string().trim().min(5).max(500) }).strict();
export const creditAllocationInputSchema = z.object({ operationKey: uuid, obligationId: uuid, amountCents: cents }).strict();
export const negotiationInputSchema = z.object({ operationKey: uuid, obligationId: uuid, negotiatedAmountCents: cents, negotiatedDueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), reason: z.string().trim().min(5).max(500) }).strict();
export const cancellationInputSchema = z.object({ operationKey: uuid, effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), reason: z.string().trim().min(5).max(500) }).strict();
export const refundInputSchema = z.object({ operationKey: uuid, amountCents: cents, method: z.literal('MANUAL'), reason: z.string().trim().min(5).max(500) }).strict();

const studentOption = z.object({ id: uuid, person: z.object({ id: uuid, name }) });
const classroomOption = z.object({ id: uuid, name, capacity: z.number().int().positive(), occupied: z.number().int().nonnegative(), active: z.boolean(), schoolYearId: uuid });

export const enrollmentSchema = enrollmentInputSchema.extend({
  id: uuid,
  status: z.literal('DRAFT'),
  initialAmountCents: z.number().int().nonnegative(),
  version: z.number().int().positive(),
  student: studentOption,
  classroom: classroomOption,
  campaign: z.object({ id: uuid, name, schoolYearId: uuid }),
  contract: z.object({ id: uuid, campaignId: uuid, title: name, version: z.number().int().positive(), initialInstallmentCents: z.number().int().nonnegative(), totalAnnualCents: z.number().int().nonnegative() }),
  financialResponsible: z.object({ id: uuid, name }),
  entryMonth: z.number().int().min(1).max(12).nullable(),
  entryInstallmentCount: z.number().int().positive().nullable(),
  entryTotalCents: z.number().int().positive().nullable(),
});

const refundSchema = z.object({ id: uuid, amountCents: z.number().int().positive(), method: name, status: z.literal('EXECUTED'), reason: name, executedAt: z.iso.datetime() });
const cancellationSchema = z.object({ id: uuid, effectiveDate: z.string(), reason: name, refundableAmountCents: z.number().int().nonnegative(), availableCreditCents: z.number().int().nonnegative(), refund: refundSchema.nullable() });

export const enrollmentOverviewSchema = z.object({
  enrollments: z.array(enrollmentSchema),
  confirmed: z.array(z.object({ id: uuid, student: studentOption, classroom: z.object({ id: uuid, name, schoolYearId: uuid }), status: z.enum(['CONFIRMED', 'CANCELLED']), initialSettlement: z.object({ settlement: z.enum(['PAYMENT', 'WAIVER', 'NEGOTIATION']), amountCents: z.number().int().nonnegative() }), remainingInstallments: z.number().int().nonnegative(), cancellation: cancellationSchema.nullable(), obligations: z.array(z.object({ id: uuid, installment: z.number().int().nonnegative(), dueDate: z.string(), amountCents: z.number().int().nonnegative(), settledAmountCents: z.number().int().nonnegative(), status: z.enum(['SETTLED', 'PARTIAL', 'OPEN', 'WAIVED', 'CANCELLED']), negotiation: z.object({ originalAmountCents: z.number().int().positive(), negotiatedAmountCents: z.number().int().positive(), originalDueDate: z.string(), negotiatedDueDate: z.string(), reason: name }).nullable() })), negotiations: z.array(z.object({ id: uuid, obligationId: uuid, originalAmountCents: z.number().int().positive(), negotiatedAmountCents: z.number().int().positive(), originalDueDate: z.string(), negotiatedDueDate: z.string(), reason: name, createdAt: z.iso.datetime() })), payments: z.array(z.object({ id: uuid, receiptNumber: name, amountCents: z.number().int().positive(), status: z.enum(['POSTED', 'REVERSED']), receivedAt: z.iso.datetime(), credit: z.object({ id: uuid, balanceCents: z.number().int().nonnegative(), status: z.enum(['AVAILABLE', 'CONSUMED', 'REVERSED']) }).nullable() })), credits: z.array(z.object({ id: uuid, originalAmountCents: z.number().int().positive(), balanceCents: z.number().int().nonnegative(), status: z.enum(['AVAILABLE', 'CONSUMED', 'REVERSED']) })) })),
  students: z.array(studentOption.extend({ financialResponsible: z.object({ id: uuid, name }).nullable() })),
  classrooms: z.array(classroomOption),
  campaigns: z.array(z.object({ id: uuid, name, schoolYearId: uuid })),
  contracts: z.array(z.object({ id: uuid, campaignId: uuid, title: name, version: z.number().int().positive(), initialInstallmentCents: z.number().int().nonnegative(), totalAnnualCents: z.number().int().nonnegative() })),
});

export type EnrollmentInput = z.infer<typeof enrollmentInputSchema>;
export type Enrollment = z.infer<typeof enrollmentSchema>;
export type EnrollmentOverview = z.infer<typeof enrollmentOverviewSchema>;
export type CancellationInput = z.infer<typeof cancellationInputSchema>;
export type RefundInput = z.infer<typeof refundInputSchema>;
