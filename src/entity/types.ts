import { IEmployee } from '@/entity/employee.entity';
import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { ERole } from '@/entity/enums/ERole';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import { z } from 'zod';

export interface UserInputCondition {
  // 스케쥴 시작일
  startDateDay: DateDay;

  // 최대 연속 근무 일수
  maxWorkComboDayCount: number;

  // 각 근무자의 고유 사정 조건
  employeeConditions: EmployeeCondition[];

  // 근무 조건
  workConditionOfWeek: WorkConditionOfWeek;
}

export const IAbleWorkTimeSchema = z.record(
  z.nativeEnum(EDayOfWeek),
  z.array(z.nativeEnum(EWorkTime)),
);

export const IEmployeeSchema = z.object({
  id: z.number(),
  name: z.string(),
  ableWorkPosition: z.array(z.nativeEnum(EWorkPosition)),
  ableWorkTime: IAbleWorkTimeSchema,
  role: z.nativeEnum(ERole),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

export const EmployeeConditionSchema = z.object({
  employee: IEmployeeSchema,
  ableMinWorkCount: z.number().default(1),
  ableMaxWorkCount: z.number().default(4),
  additionalUnableDayOff: z.array(z.nativeEnum(EDayOfWeek)).default([]),
});

export const DateDayEntitySchema = z.object({
  date: z.coerce.date(),
  dayOfWeek: z.nativeEnum(EDayOfWeek),
  startDate: z.coerce.date(),
});

export const WorkConditionEntrySchema = z.object({
  dateDay: DateDayEntitySchema,
  employee: IEmployeeSchema.optional(),
  workPosition: z.nativeEnum(EWorkPosition),
  workTime: z.nativeEnum(EWorkTime),
  workTimeStart: z.coerce.date().optional(),
  workTimeEnd: z.coerce.date().optional(),
});

export const WorkConditionSchema = z.record(
  z.nativeEnum(EDayOfWeek),
  z.array(WorkConditionEntrySchema).default([]),
);

export const UserInputConditionSchema = z.object({
  startIDateDayEntity: DateDayEntitySchema,
  employeeConditions: z.array(EmployeeConditionSchema),
  maxSchedule: z.number().max(100).min(0),
  maxWorkComboDayCount: z.number().default(2),
  workConditionOfWeek: WorkConditionSchema,
});

export type IDateDayEntity = z.infer<typeof DateDayEntitySchema>;
export type IAbleWorkTime = z.infer<typeof IAbleWorkTimeSchema>;
export type WorkConditionEntry = z.infer<typeof WorkConditionEntrySchema>;
export type WorkConditionOfWeek = z.infer<typeof WorkConditionSchema>;
export type EmployeeCondition = z.infer<typeof EmployeeConditionSchema>;
export type IEmployeeSchemaType = z.infer<typeof IEmployeeSchema>;
