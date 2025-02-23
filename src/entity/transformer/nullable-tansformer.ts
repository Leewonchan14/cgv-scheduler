/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValueTransformer } from 'typeorm';

export class NullableTransformer implements ValueTransformer {
  to(entityValue: any): any {
    if (entityValue === undefined) return null;
    return entityValue;
  }
  from(db: any) {
    if (db === null) return undefined;
    return db;
  }
}
