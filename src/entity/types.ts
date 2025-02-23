import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { ERole } from '@/entity/enums/ERole';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { WorkTimeSlotSchema } from '@/feature/schedule/work-time-slot-handler';
import { z } from 'zod';

// export interface APIUserInputCondition {
//   // 스케쥴 시작일
//   startDateDay: DateDay;

//   // 최대 연속 근무 일수
//   maxWorkComboDayCount: number;

//   // 각 근무자의 고유 사정 조건
//   employeeConditions: OmitStrict<EmployeeCondition, 'employee'> &
//     {
//       employee: Pick<IEmployeeSchemaType, 'id'>;
//     }[];

//   // 근무 조건
//   workConditionOfWeek: WorkConditionOfWeek;
// }

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

export const ScheduleEntrySchema = z.object({
  id: z.string(),
  date: z.coerce.date(),
  employee: IEmployeeSchema.optional(),
  workPosition: z.nativeEnum(EWorkPosition),
  workTime: z.nativeEnum(EWorkTime),
  timeSlot: WorkTimeSlotSchema,
});

export const ScheduleSchema = z.object({
  [EDayOfWeek.월]: z.array(ScheduleEntrySchema).default([]),
  [EDayOfWeek.화]: z.array(ScheduleEntrySchema).default([]),
  [EDayOfWeek.수]: z.array(ScheduleEntrySchema).default([]),
  [EDayOfWeek.목]: z.array(ScheduleEntrySchema).default([]),
  [EDayOfWeek.금]: z.array(ScheduleEntrySchema).default([]),
  [EDayOfWeek.토]: z.array(ScheduleEntrySchema).default([]),
  [EDayOfWeek.일]: z.array(ScheduleEntrySchema).default([]),
});

export const WorkConditionEntrySchema = ScheduleEntrySchema.extend({
  employee: IEmployeeSchema.optional(),
});

export const WorkConditionOfWeekSchema = z.object({
  [EDayOfWeek.월]: z.array(WorkConditionEntrySchema).default([]),
  [EDayOfWeek.화]: z.array(WorkConditionEntrySchema).default([]),
  [EDayOfWeek.수]: z.array(WorkConditionEntrySchema).default([]),
  [EDayOfWeek.목]: z.array(WorkConditionEntrySchema).default([]),
  [EDayOfWeek.금]: z.array(WorkConditionEntrySchema).default([]),
  [EDayOfWeek.토]: z.array(WorkConditionEntrySchema).default([]),
  [EDayOfWeek.일]: z.array(WorkConditionEntrySchema).default([]),
});

export const EmployeeConditionWithIdSchema = EmployeeConditionSchema.extend({
  employee: z.object({
    id: z.coerce.number(),
  }),
});

export const APIScheduleSchema = z.object({
  [EDayOfWeek.월]: z.array(ScheduleEntrySchema),
  [EDayOfWeek.화]: z.array(ScheduleEntrySchema),
  [EDayOfWeek.수]: z.array(ScheduleEntrySchema),
  [EDayOfWeek.목]: z.array(ScheduleEntrySchema),
  [EDayOfWeek.금]: z.array(ScheduleEntrySchema),
  [EDayOfWeek.토]: z.array(ScheduleEntrySchema),
  [EDayOfWeek.일]: z.array(ScheduleEntrySchema),
});

export const APIUserInputConditionSchema = z.object({
  startDate: z.coerce.date(),
  employeeConditions: z.array(EmployeeConditionWithIdSchema),
  maxSchedule: z.number().max(100).min(0),
  maxWorkComboDayCount: z.number().default(2),
  workConditionOfWeek: WorkConditionOfWeekSchema,
  multiLimit: z.number().default(3),
});

export const APIPossibleEmployeeSchema = APIUserInputConditionSchema.omit({
  maxSchedule: true,
}).extend({
  workConditionEntry: WorkConditionEntrySchema,
});

export type IAbleWorkTime = z.infer<typeof IAbleWorkTimeSchema>;
export type WorkConditionEntry = z.infer<typeof WorkConditionEntrySchema>;
export type WorkConditionOfWeek = z.infer<typeof WorkConditionOfWeekSchema>;
export type EmployeeCondition = z.infer<typeof EmployeeConditionSchema>;
export type IEmployeeSchemaType = z.infer<typeof IEmployeeSchema>;
export type IScheduleEntry = z.infer<typeof ScheduleEntrySchema>;
export type IStrictSchedule = z.infer<typeof ScheduleSchema>;
export type ISchedule = z.infer<typeof ScheduleSchema>;
export type EmployeeConditionWithId = z.infer<
  typeof EmployeeConditionWithIdSchema
>;
export type APIUserInputCondition = z.infer<typeof APIUserInputConditionSchema>;
export type APIPossibleEmployeeType = z.infer<typeof APIPossibleEmployeeSchema>;

export interface UserInputCondition {
  // 스케쥴 시작일
  startDate: Date;

  // 최대 연속 근무 일수
  maxWorkComboDayCount: number;

  // 각 근무자의 고유 사정 조건
  employeeConditions: EmployeeCondition[];

  // 근무 조건
  workConditionOfWeek: WorkConditionOfWeek;

  // 멀티조건 인원수
  multiLimit: number;
}
