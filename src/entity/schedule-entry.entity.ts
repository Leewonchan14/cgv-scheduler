import { DateDayEntity } from '@/entity/date-day.entity';
import { Employee } from '@/entity/employee.entity';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import type { HourMinute } from '@/entity/enums/EWorkTime';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { Schedule } from '@/entity/schedule.entity';
import { DateDay } from '@/entity/interface/DateDay';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

// 하루에 대한 스케쥴 엔트리
@Entity({ name: 'schedule_entry' })
export class ScheduleEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Schedule, (schedule) => schedule.entries)
  @JoinColumn()
  schedule: Schedule;

  @OneToOne(() => DateDayEntity, { eager: true })
  @JoinColumn()
  dateDay: DateDay;

  @ManyToOne(() => Employee, { eager: true })
  @JoinColumn()
  employee: Employee;

  @Column({ type: 'enum', enum: EWorkPosition })
  workPosition: EWorkPosition;

  @Column({ type: 'enum', enum: EWorkTime })
  workTime: EWorkTime;

  @Column({ type: 'simple-json', nullable: true })
  startTime?: HourMinute; // workTime이 '선택'인 경우

  @Column({ type: 'simple-json', nullable: true })
  endTime?: HourMinute; // workTime이 '선택'인 경우
}
