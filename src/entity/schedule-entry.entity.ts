import { Employee } from '@/entity/employee.entity';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { IScheduleEntry, type IEmployeeSchemaType } from '@/entity/types';
import { type IWorkTimeSlot } from '@/feature/schedule/work-time-slot-handler';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

// 하루에 대한 스케쥴 엔트리
@Entity({ name: 'schedule_entry' })
export class ScheduleEntry implements IScheduleEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

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
