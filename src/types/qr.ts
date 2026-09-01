import * as React from 'react';

import { QRCodeTypeEnum, NetworkTypeEnum } from '@/constants/enums';

export type TCard = React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
>;

export interface IBaseQr extends React.ComponentProps<TCard> {
  id: string;
  type: QRCodeTypeEnum;
  title?: string;
  description?: string;
  tags: string[];
  favorite: boolean;
  // compat: old field, use favorite going forward
  isBookmark?: boolean;
  createdAt: number;
  updatedAt: number;
  createdByDeviceId: string;
  updatedByDeviceId: string;
  version: number;
  deletedAt?: number | null;
  metadata?: {
    source?: `created` | `scanned` | `imported` | `synced`;
    originalFormat?: string;
  };
  content?: string;
}

export type TWifiOpenData = {
  name: string;
  networkType: NetworkTypeEnum.open;
};

export type TWifiSecureData = {
  name: string;
  networkType: NetworkTypeEnum.wep | NetworkTypeEnum.wpa_wpa2;
  password: string;
};

export type TWifi = IBaseQr & {
  type: QRCodeTypeEnum.wifi;
  data: TWifiOpenData | TWifiSecureData;
};

export type TLink = IBaseQr & {
  type: QRCodeTypeEnum.link;
  data: {
    url: string;
  };
};

export type TText = IBaseQr & {
  type: QRCodeTypeEnum.text;
  data: {
    text: string;
  };
};

export type TPhone = IBaseQr & {
  type: QRCodeTypeEnum.phone;
  data: {
    phoneNumber: string;
    name?: string;
    email?: string;
  };
};

export type TContact = IBaseQr & {
  type: QRCodeTypeEnum.contact;
  data: {
    name: string;
    phoneNumber: string;
    email?: string;
    company?: string;
    jobTitle?: string;
  };
};

export type TEmail = IBaseQr & {
  type: QRCodeTypeEnum.email;
  data: {
    to: string;
    cc?: string;
    subject: string;
    body?: string;
  };
};

export type TSms = IBaseQr & {
  type: QRCodeTypeEnum.sms;
  data: {
    to: string;
    text?: string;
  };
};

export type TBook = IBaseQr & {
  type: QRCodeTypeEnum.book;
  data: {
    title: string;
    author?: string;
    isbn13?: string;
  };
};

export type TQr =
  | TWifi
  | TLink
  | TText
  | TContact
  | TEmail
  | TPhone
  | TBook
  | TSms;

// Helper to get favorite regardless of old/new field
export function getFavorite(qr: IBaseQr): boolean {
  return qr.favorite ?? qr.isBookmark ?? false;
}
