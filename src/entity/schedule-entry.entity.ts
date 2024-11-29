import {
  DateDayEntity,
  DateDayEntitySchema,
  type IDateDayEntity,
} from '@/entity/date-day.entity';
import { Employee } from '@/entity/employee.entity';
import { EDAY_OF_WEEKS, EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { IEmployeeSchema, type IEmployeeSchemaType } from '@/entity/types';
import {
  WorkTimeSlotSchema,
  type IWorkTimeSlot,
} from '@/feature/schedule/work-time-slot-handler';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { z, ZodArray } from 'zod';

// 하루에 대한 스케쥴 엔트리
@Entity({ name: 'schedule_entry' })
export class ScheduleEntry implements IScheduleEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => DateDayEntity, { eager: true })
  @JoinColumn()
  dateDay: IDateDayEntity;

  @ManyToOne(() => Employee, { eager: true })
  @JoinColumn()
  employee: IEmployeeSchemaType;

  @Column({ type: 'enum', enum: EWorkPosition })
  workPosition: EWorkPosition;

  @Column({ type: 'enum', enum: EWorkTime })
  workTime: EWorkTime;

  @Column({ type: 'simple-json' })
  timeSlot: IWorkTimeSlot;
}

export const ScheduleEntrySchema = z.object({
  id: z.number(),
  dateDay: DateDayEntitySchema,
  employee: IEmployeeSchema,
  workPosition: z.nativeEnum(EWorkPosition),
  workTime: z.nativeEnum(EWorkTime),
  timeSlot: WorkTimeSlotSchema,
});

export type IScheduleEntry = z.infer<typeof ScheduleEntrySchema>;

export const ScheduleSchema = z.object({
  [EDayOfWeek.월]: z.array(ScheduleEntrySchema).default([]),
  [EDayOfWeek.화]: z.array(ScheduleEntrySchema).default([]),
  [EDayOfWeek.수]: z.array(ScheduleEntrySchema).default([]),
  [EDayOfWeek.목]: z.array(ScheduleEntrySchema).default([]),
  [EDayOfWeek.금]: z.array(ScheduleEntrySchema).default([]),
  [EDayOfWeek.토]: z.array(ScheduleEntrySchema).default([]),
  [EDayOfWeek.일]: z.array(ScheduleEntrySchema).default([]),
});

export type IStrictSchedule = z.infer<typeof ScheduleSchema>;

export type ISchedule = z.infer<typeof ScheduleSchema>;
