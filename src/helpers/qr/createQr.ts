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

export function qrToFormValues(qr: TQr): QrFormValues {
  const base = {
    title: qr.title ?? ``,
    description: qr.description ?? ``,
    isBookmark: qr.isBookmark ?? false,
    type: qr.type,
  } as Record<string, unknown>;
  switch (qr.type) {
    case QRCodeTypeEnum.link:
      return { ...base, url: (qr.data as { url: string }).url } as QrFormValues;
    case QRCodeTypeEnum.text:
      return {
        ...base,
        text: (qr.data as { text: string }).text,
      } as QrFormValues;
    case QRCodeTypeEnum.wifi: {
      const d = qr.data as {
        name: string;
        networkType: NetworkTypeEnum;
        password?: string;
      };
      return {
        ...base,
        name: d.name,
        networkType: d.networkType,
        password: d.password ?? ``,
      } as QrFormValues;
    }
    case QRCodeTypeEnum.email: {
      const d = qr.data as {
        to: string;
        cc?: string;
        subject: string;
        body?: string;
      };
      return {
        ...base,
        to: d.to,
        cc: d.cc ?? ``,
        subject: d.subject,
        body: d.body ?? ``,
      } as QrFormValues;
    }
    case QRCodeTypeEnum.phone: {
      const d = qr.data as {
        phoneNumber: string;
        name?: string;
        email?: string;
      };
      return {
        ...base,
        phoneNumber: d.phoneNumber,
        name: d.name ?? ``,
        email: d.email ?? ``,
      } as QrFormValues;
    }
    case QRCodeTypeEnum.contact: {
      const d = qr.data as {
        name: string;
        phoneNumber: string;
        email?: string;
        company?: string;
        jobTitle?: string;
      };
      return {
        ...base,
        name: d.name,
        phoneNumber: d.phoneNumber,
        email: d.email ?? ``,
        company: d.company ?? ``,
        jobTitle: d.jobTitle ?? ``,
      } as QrFormValues;
    }
    case QRCodeTypeEnum.sms: {
      const d = qr.data as { to: string; text?: string };
      return { ...base, to: d.to, text: d.text ?? `` } as QrFormValues;
    }
    case QRCodeTypeEnum.book: {
      const d = qr.data as { title: string; author?: string; isbn13?: string };
      return {
        ...base,
        bookTitle: d.title,
        author: d.author ?? ``,
        isbn13: d.isbn13 ?? ``,
      } as QrFormValues;
    }
    default:
      return base as QrFormValues;
  }
}

export function applyFormValuesToQr(existing: TQr, values: QrFormValues): TQr {
  const updatedData = createQrFromFormValues(values) as TQr;
  return {
    ...existing,
    title: updatedData.title,
    description: updatedData.description,
    isBookmark: updatedData.isBookmark,
    data: updatedData.data,
    updatedAt: new Date().toISOString(),
  } as TQr;
}
