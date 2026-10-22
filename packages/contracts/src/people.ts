import { z } from 'zod';

const civilDate = z.iso.date();
const personName = z.string().trim().min(2).max(100);
const evidence = z.string().trim().min(5).max(500);
const validPeriod = { validFrom: civilDate, validUntil: civilDate };
const version = z.object({ version: z.number().int().positive(), reason: z.string().trim().min(5).max(300) }).strict();

export const personInputSchema = z.object({ name: personName, email: z.email().max(254).transform(value => value.trim().toLowerCase()).nullable(), phone: z.string().trim().min(8).max(30).nullable(), birthDate: civilDate.nullable() }).strict();
export const personEditSchema = version.extend({ data: personInputSchema });
export const studentInputSchema = z.object({ personId: z.uuid() }).strict();
export const parentageInputSchema = z.object({ personId: z.uuid(), role: z.enum(['MOTHER', 'FATHER', 'OTHER']), evidence, ...validPeriod }).strict().refine(value => value.validFrom <= value.validUntil, { message: 'A validade final não pode ser anterior à inicial.', path: ['validUntil'] });
export const representationInputSchema = z.object({ personId: z.uuid(), kind: z.enum(['LEGAL_GUARDIAN', 'LEGAL_REPRESENTATIVE']), evidence, restrictions: z.string().trim().max(500).nullable(), ...validPeriod }).strict().refine(value => value.validFrom <= value.validUntil, { message: 'A validade final não pode ser anterior à inicial.', path: ['validUntil'] });
export const financialInputSchema = z.object({ personId: z.uuid(), evidence }).strict();
export const pickupInputSchema = z.object({ personId: z.uuid(), evidence, restrictions: z.string().trim().max(500).nullable(), ...validPeriod }).strict().refine(value => value.validFrom <= value.validUntil, { message: 'A validade final não pode ser anterior à inicial.', path: ['validUntil'] });
export const linkEditSchema = version.extend({ data: z.unknown() });
export const personResourceSchema = z.enum(['parentage', 'representation', 'financial', 'pickup']);
export type PersonResource = z.infer<typeof personResourceSchema>;

const personSchema = personInputSchema.extend({ id: z.uuid(), version: z.number().int().positive() });
const studentSchema = z.object({ id: z.uuid(), personId: z.uuid(), active: z.boolean(), version: z.number().int().positive(), person: personSchema, parentage: z.array(z.object({ id: z.uuid(), personId: z.uuid(), role: z.enum(['MOTHER', 'FATHER', 'OTHER']), evidence, ...validPeriod, version: z.number().int().positive(), person: personSchema })), representations: z.array(z.object({ id: z.uuid(), personId: z.uuid(), kind: z.enum(['LEGAL_GUARDIAN', 'LEGAL_REPRESENTATIVE']), evidence, restrictions: z.string().nullable(), ...validPeriod, version: z.number().int().positive(), person: personSchema })), financial: z.object({ id: z.uuid(), personId: z.uuid(), evidence, version: z.number().int().positive(), person: personSchema }).nullable(), pickup: z.array(z.object({ id: z.uuid(), personId: z.uuid(), evidence, restrictions: z.string().nullable(), ...validPeriod, version: z.number().int().positive(), person: personSchema })) });
export const peopleOverviewSchema = z.object({ people: z.array(personSchema), students: z.array(studentSchema), possibleSiblings: z.array(z.object({ studentIds: z.array(z.uuid()).min(2), basis: z.enum(['PARENTAGE', 'FINANCIAL_RESPONSIBLE']) })) });
export type Person = z.infer<typeof personSchema>;
export type Student = z.infer<typeof studentSchema>;
export type PeopleOverview = z.infer<typeof peopleOverviewSchema>;
