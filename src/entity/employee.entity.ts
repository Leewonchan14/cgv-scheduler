import { ERole } from '@/entity/enums/ERole';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import type { IAbleWorkTime } from '@/entity/enums/EWorkTime';
import { TimeStampEntity } from '@/entity/timstamp.entity';
import { 암호화 } from '@/feature/employee/util/jwt';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'employee' })
export class Employee extends TimeStampEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true, nullable: false, length: 30 })
  name: string;

  @Column({ type: 'enum', enum: EWorkPosition, array: true, default: [] })
  ableWorkPosition: EWorkPosition[];

  @Column({ type: 'simple-json' })
  ableWorkTime: IAbleWorkTime;

  @Column({ nullable: false, default: 암호화('1234') })
  password: string;

  @Column({
    type: 'enum',
    enum: ERole,
    nullable: false,
    default: ERole.EMPLOYEE,
  })
  role: ERole;
}
