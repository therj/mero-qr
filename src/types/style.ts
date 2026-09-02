import { Options as QrOptions } from 'qr-code-styling';

export interface QRStyle {
  id: string;
  name: string;
  options: Partial<QrOptions>;
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}

export const defaultStyleOptions: Partial<QrOptions> = {
  width: 200,
  height: 200,
  type: `canvas`,
  data: ``,
  dotsOptions: {
    color: `#000000`,
    type: `square`,
  },
  backgroundOptions: {
    color: `#ffffff`,
  },
  cornersSquareOptions: {
    type: `square`,
  },
  cornersDotOptions: {
    type: `square`,
  },
  imageOptions: {
    crossOrigin: `anonymous`,
    margin: 4,
  },
};
