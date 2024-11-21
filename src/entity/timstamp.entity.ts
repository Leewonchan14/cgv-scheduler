import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class TimeStampEntity {
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
