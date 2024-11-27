import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { IDateDayEntity } from '@/entity/types';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'date_day' })
export class DateDayEntity implements IDateDayEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @Column({ type: 'enum', enum: EDayOfWeek })
  dayOfWeek: EDayOfWeek;

  @Column()
  startDate: Date;
}
