import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'date_day' })
export class DateDayEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @Column({ type: 'enum', enum: EDayOfWeek })
  dayOfWeek: EDayOfWeek;

  @Column()
  startDate: Date;
}

export interface IDateDayEntity {
  date: Date;
  dayOfWeek: EDayOfWeek;
  startDate: Date;
}
