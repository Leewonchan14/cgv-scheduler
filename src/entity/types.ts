import { OmitStrict } from '@/app/api/types';
import { DateDayEntitySchema } from '@/entity/date-day.entity';
import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { ERole } from '@/entity/enums/ERole';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { DateDay } from '@/entity/interface/DateDay';
import { ScheduleEntrySchema } from '@/entity/schedule-entry.entity';
import { z } from 'zod';

export interface APIUserInputCondition {
  // 스케쥴 시작일
  startDateDay: DateDay;

  // 최대 연속 근무 일수
  maxWorkComboDayCount: number;

  // 각 근무자의 고유 사정 조건
  employeeConditions: OmitStrict<EmployeeCondition, 'employee'> &
    {
      employee: Pick<IEmployeeSchemaType, 'id'>;
    }[];

  // 근무 조건
  workConditionOfWeek: WorkConditionOfWeek;
}

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

export const WorkConditionEntrySchema = ScheduleEntrySchema.extend({
  employee: IEmployeeSchema.optional(),
});

export const WorkConditionSchema = z.record(
  z.nativeEnum(EDayOfWeek),
  z.array(WorkConditionEntrySchema).default([]),
);

export const APIUserInputConditionSchema = z.object({
  startIDateDayEntity: DateDayEntitySchema,
  employeeConditions: z.array(
    EmployeeConditionSchema.omit({ employee: true }).extend({
      employee: z.object({
        id: z.coerce.number(),
      }),
    }),
  ),
  maxSchedule: z.number().max(100).min(0),
  maxWorkComboDayCount: z.number().default(2),
  workConditionOfWeek: WorkConditionSchema,
});

export type IAbleWorkTime = z.infer<typeof IAbleWorkTimeSchema>;
export type WorkConditionEntry = z.infer<typeof WorkConditionEntrySchema>;
export type WorkConditionOfWeek = z.infer<typeof WorkConditionSchema>;
export type EmployeeCondition = z.infer<typeof EmployeeConditionSchema>;
export type IEmployeeSchemaType = z.infer<typeof IEmployeeSchema>;
