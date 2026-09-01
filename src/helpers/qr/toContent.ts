import {
  TQr,
  TBook,
  TContact,
  TEmail,
  TLink,
  TPhone,
  TSms,
  TText,
  TWifi,
} from '@/types/qr';
import { QRCodeTypeEnum, NetworkTypeEnum } from '@/constants/enums';

export function qrToContent(qr: TQr): string {
  // if already has content, use it
  if (qr.content) return qr.content;
  switch (qr.type) {
    case QRCodeTypeEnum.link: {
      const d = (qr as TLink).data;
      return d.url;
    }
    case QRCodeTypeEnum.text: {
      const d = (qr as TText).data;
      return d.text;
    }
    case QRCodeTypeEnum.wifi: {
      const d = (qr as TWifi).data as TWifi[`data`];
      const sec =
        d.networkType === NetworkTypeEnum.open ? `nopass` : d.networkType;
      const pass = (d as { password?: string }).password ?? ``;
      // WIFI:T:WPA;S:MyNet;P:password;;
      if (d.networkType === NetworkTypeEnum.open) {
        return `WIFI:T:nopass;S:${d.name};;`;
      }
      return `WIFI:T:${sec};S:${d.name};P:${pass};;`;
    }
    case QRCodeTypeEnum.email: {
      const d = (qr as TEmail).data;
      const params = new URLSearchParams();
      if (d.cc) params.set(`cc`, d.cc);
      if (d.subject) params.set(`subject`, d.subject);
      if (d.body) params.set(`body`, d.body);
      const qs = params.toString();
      return `mailto:${d.to}${qs ? `?${qs}` : ``}`;
    }
    case QRCodeTypeEnum.phone: {
      const d = (qr as TPhone).data;
      return `tel:${d.phoneNumber}`;
    }
    case QRCodeTypeEnum.contact: {
      const d = (qr as TContact).data;
      const lines = [
        `BEGIN:VCARD`,
        `VERSION:3.0`,
        `FN:${d.name}`,
        `TEL:${d.phoneNumber}`,
      ];
      if (d.email) lines.push(`EMAIL:${d.email}`);
      if (d.company) lines.push(`ORG:${d.company}`);
      if (d.jobTitle) lines.push(`TITLE:${d.jobTitle}`);
      lines.push(`END:VCARD`);
      return lines.join(`\n`);
    }
    case QRCodeTypeEnum.sms: {
      const d = (qr as TSms).data;
      if (d.text) return `SMSTO:${d.to}:${d.text}`;
      return `sms:${d.to}`;
    }
    case QRCodeTypeEnum.book: {
      const d = (qr as TBook).data;
      const parts = [d.title];
      if (d.author) parts.push(`by ${d.author}`);
      if (d.isbn13) parts.push(`ISBN:${d.isbn13}`);
      return parts.join(` `);
    }
    default: {
      const { data } = qr as unknown as { data: unknown };
      return JSON.stringify(data);
    }
  }
}
