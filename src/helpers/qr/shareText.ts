import { TQr } from '@/types/qr';
import { QRCodeTypeEnum } from '@/constants/enums';

export function getShareText(qr: TQr): string {
  const title = qr.title ? `Title: ${qr.title}\n` : ``;
  const desc = qr.description ? `Description: ${qr.description}\n` : ``;
  let body = ``;
  switch (qr.type) {
    case QRCodeTypeEnum.link: {
      const d = qr.data as { url: string };
      body = `URL: ${d.url}`;
      break;
    }
    case QRCodeTypeEnum.text: {
      const d = qr.data as { text: string };
      body = `Text: ${d.text}`;
      break;
    }
    case QRCodeTypeEnum.wifi: {
      const d = qr.data as {
        name: string;
        networkType: string;
        password?: string;
      };
      body = `SSID: ${d.name}\nSecurity: ${d.networkType}`;
      if (d.password) body += `\nPassword: ${d.password}`;
      break;
    }
    case QRCodeTypeEnum.email: {
      const d = qr.data as {
        to: string;
        cc?: string;
        subject: string;
        body?: string;
      };
      body = `To: ${d.to}`;
      if (d.cc) body += `\nCC: ${d.cc}`;
      body += `\nSubject: ${d.subject}`;
      if (d.body) body += `\nBody: ${d.body}`;
      break;
    }
    case QRCodeTypeEnum.phone: {
      const d = qr.data as {
        phoneNumber: string;
        name?: string;
        email?: string;
      };
      body = `Phone: ${d.phoneNumber}`;
      if (d.name) body += `\nName: ${d.name}`;
      if (d.email) body += `\nEmail: ${d.email}`;
      break;
    }
    case QRCodeTypeEnum.contact: {
      const d = qr.data as {
        name: string;
        phoneNumber: string;
        email?: string;
        company?: string;
        jobTitle?: string;
      };
      body = `Name: ${d.name}\nPhone: ${d.phoneNumber}`;
      if (d.email) body += `\nEmail: ${d.email}`;
      if (d.company) body += `\nCompany: ${d.company}`;
      if (d.jobTitle) body += `\nJob: ${d.jobTitle}`;
      break;
    }
    case QRCodeTypeEnum.sms: {
      const d = qr.data as { to: string; text?: string };
      body = `To: ${d.to}`;
      if (d.text) body += `\nMessage: ${d.text}`;
      break;
    }
    case QRCodeTypeEnum.book: {
      const d = qr.data as { title: string; author?: string; isbn13?: string };
      body = `Title: ${d.title}`;
      if (d.author) body += `\nAuthor: ${d.author}`;
      if (d.isbn13) body += `\nISBN: ${d.isbn13}`;
      break;
    }
    default: {
      const { data } = qr as unknown as { data: unknown };
      body = JSON.stringify(data, null, 2);
      break;
    }
  }
  return `${title}${desc}${body}`.trim();
}

export function getShareUrl(qr: TQr): string {
  const fallback =
    typeof window !== `undefined`
      ? window.location.href
      : `https://mero-qr.local`;
  // For Facebook sharer we need a URL. If QR is link type, use its URL, otherwise use current page
  if (qr.type === QRCodeTypeEnum.link) {
    const d = qr.data as { url: string };
    try {
      const u = new URL(d.url);
      return u.toString();
    } catch {
      return fallback;
    }
  }
  return fallback;
}
