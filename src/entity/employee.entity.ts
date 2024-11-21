import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import type { IAbleWorkTime } from '@/entity/enums/EWorkTime';
import { TimeStampEntity } from '@/entity/timstamp.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Employee extends TimeStampEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false, length: 30 })
  name: string;

  @Column({ type: 'enum', enum: EWorkPosition, array: true, default: [] })
  ableWorkPosition: EWorkPosition[];

  @Column({ type: 'simple-json' })
  ableWorkTime: IAbleWorkTime;
}
