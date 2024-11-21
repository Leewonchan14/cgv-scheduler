import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { EWorkTime } from '@/entity/enums/EWorkTime';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

export type IAbleWorkTime = {
  [K in EDayOfWeek]?: EWorkTime[];
};

// @Entity()
export class Employee {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true, nullable: false, length: 30 })
  name: string;

  @Column({ enum: EWorkPosition, array: true, default: [] })
  ableWorkPosition: EWorkPosition[];

  @Column({ type: 'simple-json' })
  ableWorkTime: IAbleWorkTime;
}
