// import { EDayOfWeek } from '@/entity/enums/EDayOfWeek';
// import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
// import { z } from 'zod';

// @Entity({ name: 'date_day' })
// export class DateDayEntity implements IDateDayEntity {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column()
//   date: Date;

//   @Column({ type: 'enum', enum: EDayOfWeek })
//   dayOfWeek: EDayOfWeek;

//   @Column()
//   startDate: Date;
// }

// export const DateDayEntitySchema = z.object({
//   date: z.coerce.date(),
// });

// export type IDateDayEntity = z.infer<typeof DateDayEntitySchema>;
