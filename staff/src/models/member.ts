import * as z from "zod";

export enum PaymentStatus {
  PAID = "PAID",
  UNPAID = "UNPAID",
  PAYS_CASH = "PAYS_CASH",
}

export enum MandateStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PAYS_CASH = "PAYS_CASH",
}

const listMemberSchema = z.object({
  id: z.string().uuid(),
  fileKey: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string(),
  paymentStatus: z.nativeEnum(PaymentStatus),
});

export type ListMember = z.infer<typeof listMemberSchema>;
export const newListMember = (data: unknown): ListMember =>
  listMemberSchema.parse(data);

const memberSchema = z.object({
  id: z.string().uuid(),
  gcId: z.string().nullable(),
  fileKey: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string(),
  note: z.string().nullable(),
  email: z.string().email(),
  phoneNumber: z.string().nullable(),
  paymentStatus: z.nativeEnum(PaymentStatus),
  created: z.coerce.date(),
});

export type Member = z.infer<typeof memberSchema>;
export const newMember = (data: unknown): Member => memberSchema.parse(data);
