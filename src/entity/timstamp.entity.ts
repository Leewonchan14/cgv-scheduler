import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export class TimeStampEntity {
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @DeleteDateColumn({ default: false })
  deletedAt: Date;
}
