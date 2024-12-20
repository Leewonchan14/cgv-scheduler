import { ERole } from '@/entity/enums/ERole';
import { EWorkPosition } from '@/entity/enums/EWorkPosition';
import { TimeStampEntity } from '@/entity/timstamp.entity';
import { type IAbleWorkTime, IEmployeeSchemaType } from '@/entity/types';
import { IPayLoad } from '@/feature/auth/jwt-handler';
import { pwHandler } from '@/feature/auth/pw-handler';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'employee' })
export class Employee extends TimeStampEntity implements IEmployee {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true, nullable: false, length: 30 })
  name: string;

  @Column({ type: 'enum', enum: EWorkPosition, array: true, default: [] })
  ableWorkPosition: EWorkPosition[];

  @Column({ type: 'simple-json', default: {} })
  ableWorkTime: IAbleWorkTime;

  @Column({ nullable: true, default: pwHandler.encrypt('1234') })
  password?: string;

  @Column({
    type: 'enum',
    enum: ERole,
    nullable: false,
    default: ERole.EMPLOYEE,
  })
  role: ERole;

  toPayload(): IPayLoad {
    return {
      id: this.id,
      role: this.role,
    };
  }
}

export type IEmployee = {
  toPayload(): IPayLoad;
} & IEmployeeSchemaType;
