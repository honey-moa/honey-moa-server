import { z } from 'zod';

export const baseSchema = z
  .object({
    id: z.bigint(),
    createdAt: z.preprocess((val: any) => new Date(val), z.date()),
    updatedAt: z.preprocess((val: any) => new Date(val), z.date()),
  })
  .strict();

export type BaseModel = z.TypeOf<typeof baseSchema>;
