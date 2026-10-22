import { z } from 'zod';

const civilDate = z.iso.date();
const name = z.string().trim().min(2).max(100);
const period = { startDate: civilDate, endDate: civilDate };
export const schoolYearInputSchema = z.object({ year: z.number().int().min(1900).max(2200), ...period }).strict().refine(v => v.startDate <= v.endDate, { message: 'O fim deve ser igual ou posterior ao início.', path: ['endDate'] });
export const authorizationSchema = z.object({ authority: name, act: name, evidence: z.string().trim().min(5).max(500), validFrom: civilDate, validUntil: civilDate, demonstration: z.boolean() }).strict().refine(v => v.validFrom <= v.validUntil, { message: 'Validade final anterior à inicial.', path: ['validUntil'] });
export const stageInputSchema = z.object({ name, segment: z.enum(['INFANTIL', 'FUNDAMENTAL']), authorization: authorizationSchema.nullable() }).strict();
export const gradeInputSchema = z.object({ name, stageId: z.uuid() }).strict();
export const classroomInputSchema = z.object({ name, schoolYearId: z.uuid(), gradeId: z.uuid(), capacity: z.number().int().positive().max(2147483647) }).strict();
export const schoolResourceSchema = z.enum(['years', 'stages', 'grades', 'classrooms']);
export type SchoolResource = z.infer<typeof schoolResourceSchema>;
export const schoolInputSchemas = { years: schoolYearInputSchema, stages: stageInputSchema, grades: gradeInputSchema, classrooms: classroomInputSchema };
export const editSchoolSchema = z.object({ version: z.number().int().positive(), reason: z.string().trim().min(5).max(300), data: z.unknown() }).strict();
export const offerInputSchema = z.object({ active: z.boolean(), version: z.number().int().positive(), reason: z.string().trim().min(5).max(300) }).strict();
export const deleteSchoolSchema = z.object({ version: z.number().int().positive(), reason: z.string().trim().min(5).max(300) }).strict();
const identity = { id: z.uuid(), version: z.number().int().positive() };
export const schoolYearSchema = schoolYearInputSchema.safeExtend(identity);
export const stageSchema = stageInputSchema.extend(identity);
export const gradeSchema = gradeInputSchema.extend(identity);
export const classroomSchema = classroomInputSchema.extend({ ...identity, occupied: z.number().int().nonnegative(), active: z.boolean(), offerAvailable: z.boolean() });
export const schoolOverviewSchema = z.object({ years: z.array(schoolYearSchema), stages: z.array(stageSchema), grades: z.array(gradeSchema), classrooms: z.array(classroomSchema) });
export type SchoolYear = z.infer<typeof schoolYearSchema>;
export type SchoolStage = z.infer<typeof stageSchema>;
export type SchoolGrade = z.infer<typeof gradeSchema>;
export type Classroom = z.infer<typeof classroomSchema>;
export type SchoolOverview = z.infer<typeof schoolOverviewSchema>;
export function authorizationCovers(authorization: SchoolStage['authorization'], year: Pick<SchoolYear, 'startDate' | 'endDate'>, today: string): boolean {
  return authorization !== null && authorization.validFrom <= year.startDate && authorization.validUntil >= year.endDate && authorization.validUntil >= today;
}
