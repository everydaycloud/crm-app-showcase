import * as z from "zod";

const staffSchema = z.object({
  id: z.string().uuid(),
  created: z.coerce.date(),
  email: z.string().email(),
  emailVerified: z.coerce.date().nullable(),
});

export type Staff = z.infer<typeof staffSchema>;

export const newStaff = (data: unknown): Staff => staffSchema.parse(data);
