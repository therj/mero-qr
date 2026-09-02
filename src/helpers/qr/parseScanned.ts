import { QRCodeTypeEnum, NetworkTypeEnum } from '@/constants/enums';
import { TQr } from '@/types/qr';
import { nanoid } from 'nanoid';
import { getDeviceId } from '@/lib/device';
import { detectType } from './detectType';

export function parseScannedToQr(
  content: string
): Partial<TQr> & { type: QRCodeTypeEnum } {
  const type = detectType(content);
  const now = Date.now();
  const deviceId =
    typeof window !== `undefined` ? getDeviceId() : `scan-device`;
  const base = {
    id: nanoid(),
    title: content.slice(0, 40),
    description: `Scanned`,
    tags: [] as string[],
    favorite: false,
    isBookmark: false,
    createdAt: now,
    updatedAt: now,
    createdByDeviceId: deviceId,
    updatedByDeviceId: deviceId,
    version: 1,
    deletedAt: null,
    metadata: { source: `scanned` as const },
    content,
    type,
  } as unknown as TQr;

  switch (type) {
    case QRCodeTypeEnum.link:
      return { ...base, data: { url: content } } as Partial<TQr> & {
        type: QRCodeTypeEnum;
      };
    case QRCodeTypeEnum.email: {
      // try to parse mailto
      try {
        if (content.toLowerCase().startsWith(`mailto:`)) {
          const url = new URL(content);
          const to = url.pathname;
          const cc = url.searchParams.get(`cc`) ?? undefined;
          const subject =
            url.searchParams.get(`subject`) ?? content.slice(0, 30);
          const body = url.searchParams.get(`body`) ?? undefined;
          return {
            ...base,
            data: { to, cc, subject, body },
          } as Partial<TQr> & { type: QRCodeTypeEnum };
        }
      } catch {
        // ignore parse error, fallback
      }
      return {
        ...base,
        data: { to: content, subject: content.slice(0, 30) },
      } as Partial<TQr> & { type: QRCodeTypeEnum };
    }
    case QRCodeTypeEnum.phone: {
      const phone = content.replace(/^tel:/i, ``).trim();
      return { ...base, data: { phoneNumber: phone } } as Partial<TQr> & {
        type: QRCodeTypeEnum;
      };
    }
    case QRCodeTypeEnum.sms: {
      const m =
        content.match(/^SMSTO:([^:]+):?(.*)$/i) ??
        content.match(/^sms:([^?]+)\?body=(.*)/i);
      if (m)
        return { ...base, data: { to: m[1], text: m[2] } } as Partial<TQr> & {
          type: QRCodeTypeEnum;
        };
      return { ...base, data: { to: content } } as Partial<TQr> & {
        type: QRCodeTypeEnum;
      };
    }
    case QRCodeTypeEnum.wifi: {
      const m = content.match(/S:([^;]+);.*T:([^;]+);.*P:([^;]+);/i);
      if (m) {
        const name = m[1];
        const t = m[2].toLowerCase();
        const password = m[3];
        const networkType =
          t === `nopass` || t === `open`
            ? NetworkTypeEnum.open
            : NetworkTypeEnum.wpa_wpa2;
        return {
          ...base,
          data:
            networkType === NetworkTypeEnum.open
              ? { name, networkType }
              : { name, networkType, password },
        } as Partial<TQr> & { type: QRCodeTypeEnum };
      }
      return {
        ...base,
        data: { name: content, networkType: NetworkTypeEnum.wpa_wpa2 },
      } as Partial<TQr> & { type: QRCodeTypeEnum };
    }
    case QRCodeTypeEnum.contact: {
      const name = content.match(/FN:(.*)/)?.[1] ?? `Contact`;
      const phone = content.match(/TEL:(.*)/)?.[1] ?? ``;
      const email = content.match(/EMAIL:(.*)/)?.[1];
      return {
        ...base,
        data: { name, phoneNumber: phone, email },
      } as Partial<TQr> & { type: QRCodeTypeEnum };
    }
    default:
      return { ...base, data: { text: content } } as Partial<TQr> & {
        type: QRCodeTypeEnum;
      };
  }
}
