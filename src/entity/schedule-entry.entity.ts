import { Employee } from '@/entity/employee.entity';
import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

// 하루에 대한 스케쥴 엔트리
@Entity({ name: 'schedule_entry' })
export class ScheduleEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @ManyToOne(() => Employee, { eager: true })
  @JoinColumn()
  employee: Employee;

  @Column({ type: 'enum', enum: EWorkPosition })
  workPosition: EWorkPosition;

  @Column({ type: 'enum', enum: EWorkTime })
  workTime: EWorkTime;

  @Column({ type: 'simple-json', nullable: true })
  startTime?: { hour: number; minute: number }; // workTime이 '선택'인 경우

  @Column({ type: 'simple-json', nullable: true })
  endTime?: { hour: number; minute: number }; // workTime이 '선택'인 경우
}

export type ScheduleEntryPick = Pick<
  ScheduleEntry,
  'employee' | 'workPosition' | 'workTime' | 'startTime' | 'endTime'
>;

export type ISchedule = {
  [k in EDayOfWeek]: ScheduleEntryPick[];
};
