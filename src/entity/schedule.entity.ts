import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ScheduleEntry } from './schedule-entry.entity';

// 1주일치 스케쥴
@Entity()
export class Schedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @OneToMany(() => ScheduleEntry, (entry) => entry.schedule, {
    cascade: true,
    eager: true,
  })
  entries: ScheduleEntry[];
}
