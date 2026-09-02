import { QRCodeTypeEnum } from '@/constants/enums';

export function detectType(content: string): QRCodeTypeEnum {
  const t = content.trim();
  if (/^https?:\/\//i.test(t)) return QRCodeTypeEnum.link;
  if (/^mailto:/i.test(t)) return QRCodeTypeEnum.email;
  if (/^tel:/i.test(t)) return QRCodeTypeEnum.phone;
  if (/^SMSTO:/i.test(t) || /^sms:/i.test(t)) return QRCodeTypeEnum.sms;
  if (/^WIFI:/i.test(t)) return QRCodeTypeEnum.wifi;
  if (/^BEGIN:VCARD/i.test(t)) return QRCodeTypeEnum.contact;
  if (/^MATMSG:/i.test(t)) return QRCodeTypeEnum.email;
  // fallback to text, but try to detect email/phone
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return QRCodeTypeEnum.email;
  if (/^\+?[\d\s-]{7,}$/.test(t) && t.replace(/\D/g, ``).length >= 7)
    return QRCodeTypeEnum.phone;
  return QRCodeTypeEnum.text;
}
