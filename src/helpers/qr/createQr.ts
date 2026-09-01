import { nanoid } from 'nanoid';

import { QRCodeTypeEnum, NetworkTypeEnum } from '@/constants/enums';
import { TQr } from '@/types/qr';
import { QrFormValues } from '@/lib/validations/qr';

function getBaseFields(values: QrFormValues) {
  return {
    id: nanoid(),
    title: values.title?.trim() || undefined,
    description: values.description?.trim() || undefined,
    isBookmark: values.isBookmark ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function createQrFromFormValues(values: QrFormValues): TQr {
  const base = getBaseFields(values);

  switch (values.type) {
    case QRCodeTypeEnum.link:
      return {
        ...base,
        type: QRCodeTypeEnum.link,
        data: { url: values.url.trim() },
      };
    case QRCodeTypeEnum.text:
      return {
        ...base,
        type: QRCodeTypeEnum.text,
        data: { text: values.text },
      };
    case QRCodeTypeEnum.wifi: {
      const isOpen = values.networkType === NetworkTypeEnum.open;
      return {
        ...base,
        type: QRCodeTypeEnum.wifi,
        data: isOpen
          ? { name: values.name, networkType: values.networkType }
          : {
              name: values.name,
              networkType: values.networkType,
              password: values.password!,
            },
      } as TQr;
    }
    case QRCodeTypeEnum.email:
      return {
        ...base,
        type: QRCodeTypeEnum.email,
        data: {
          to: values.to,
          cc: values.cc?.trim() || undefined,
          subject: values.subject,
          body: values.body?.trim() || undefined,
        },
      };
    case QRCodeTypeEnum.phone:
      return {
        ...base,
        type: QRCodeTypeEnum.phone,
        data: {
          phoneNumber: values.phoneNumber,
          name: values.name?.trim() || undefined,
          email: values.email?.trim() || undefined,
        },
      };
    case QRCodeTypeEnum.contact:
      return {
        ...base,
        type: QRCodeTypeEnum.contact,
        data: {
          name: values.name,
          phoneNumber: values.phoneNumber,
          email: values.email?.trim() || undefined,
          company: values.company?.trim() || undefined,
          jobTitle: values.jobTitle?.trim() || undefined,
        },
      };
    case QRCodeTypeEnum.sms:
      return {
        ...base,
        type: QRCodeTypeEnum.sms,
        data: {
          to: values.to,
          text: values.text?.trim() || undefined,
        },
      };
    case QRCodeTypeEnum.book:
      return {
        ...base,
        type: QRCodeTypeEnum.book,
        data: {
          title: values.bookTitle,
          author: values.author?.trim() || undefined,
          isbn13: values.isbn13?.trim() || undefined,
        },
      };
    default:
      throw new Error(`Unsupported QR type`);
  }
}
