import * as z from 'zod';

import { NetworkTypeEnum, QRCodeTypeEnum } from '@/constants/enums';

export const commonFieldsSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  isBookmark: z.boolean().optional().default(false),
  favorite: z.boolean().optional(),
  tags: z.array(z.string()).optional().default([]),
});

export const linkSchema = commonFieldsSchema.extend({
  type: z.literal(QRCodeTypeEnum.link),
  url: z.string().min(1, `URL is required`).url(`Must be a valid URL`),
});

export const textSchema = commonFieldsSchema.extend({
  type: z.literal(QRCodeTypeEnum.text),
  text: z.string().min(1, `Text is required`),
});

export const wifiSchema = commonFieldsSchema
  .extend({
    type: z.literal(QRCodeTypeEnum.wifi),
    name: z.string().min(1, `Network name is required`),
    networkType: z.nativeEnum(NetworkTypeEnum),
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.networkType !== NetworkTypeEnum.open &&
      (!data.password || data.password.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Password is required for secured networks`,
        path: [`password`],
      });
    }
  });

export const emailSchema = commonFieldsSchema.extend({
  type: z.literal(QRCodeTypeEnum.email),
  to: z.string().min(1, `Recipient is required`).email(`Must be a valid email`),
  cc: z
    .string()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: `Must be a valid email`,
    }),
  subject: z.string().min(1, `Subject is required`),
  body: z.string().optional(),
});

export const phoneSchema = commonFieldsSchema.extend({
  type: z.literal(QRCodeTypeEnum.phone),
  phoneNumber: z.string().min(1, `Phone number is required`),
  name: z.string().optional(),
  email: z
    .string()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: `Must be a valid email`,
    }),
});

export const contactSchema = commonFieldsSchema.extend({
  type: z.literal(QRCodeTypeEnum.contact),
  name: z.string().min(1, `Name is required`),
  phoneNumber: z.string().min(1, `Phone number is required`),
  email: z
    .string()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: `Must be a valid email`,
    }),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
});

export const smsSchema = commonFieldsSchema.extend({
  type: z.literal(QRCodeTypeEnum.sms),
  to: z.string().min(1, `Recipient is required`),
  text: z.string().optional(),
});

export const bookSchema = commonFieldsSchema.extend({
  type: z.literal(QRCodeTypeEnum.book),
  bookTitle: z.string().min(1, `Title is required`),
  author: z.string().optional(),
  isbn13: z
    .string()
    .optional()
    .refine((v) => !v || /^\d{13}$/.test(v), {
      message: `ISBN must be 13 digits`,
    }),
});

export const qrSchemas = {
  [QRCodeTypeEnum.link]: linkSchema,
  [QRCodeTypeEnum.text]: textSchema,
  [QRCodeTypeEnum.wifi]: wifiSchema,
  [QRCodeTypeEnum.email]: emailSchema,
  [QRCodeTypeEnum.phone]: phoneSchema,
  [QRCodeTypeEnum.contact]: contactSchema,
  [QRCodeTypeEnum.sms]: smsSchema,
  [QRCodeTypeEnum.book]: bookSchema,
} as const;

export type QrFormValues =
  | z.infer<typeof linkSchema>
  | z.infer<typeof textSchema>
  | z.infer<typeof wifiSchema>
  | z.infer<typeof emailSchema>
  | z.infer<typeof phoneSchema>
  | z.infer<typeof contactSchema>
  | z.infer<typeof smsSchema>
  | z.infer<typeof bookSchema>;

export function getQrSchema(type: QRCodeTypeEnum) {
  return qrSchemas[type];
}
