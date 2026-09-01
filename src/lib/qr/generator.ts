'use client';

import QRCodeStyling, { Options as QrOptions } from 'qr-code-styling';

export interface QRGenerator {
  generate(content: string, options?: Partial<QrOptions>): Promise<Blob>;
  getDataUrl(content: string, options?: Partial<QrOptions>): Promise<string>;
}

export const defaultQrOptions: Partial<QrOptions> = {
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

class QrCodeStylingGenerator implements QRGenerator {
  // eslint-disable-next-line class-methods-use-this
  async generate(content: string, options?: Partial<QrOptions>): Promise<Blob> {
    const qr = new QRCodeStyling({
      ...defaultQrOptions,
      ...options,
      data: content,
    });
    const blob = await qr.getRawData(`png`);
    if (!blob) throw new Error(`Failed to generate QR`);
    return blob as Blob;
  }

  async getDataUrl(
    content: string,
    options?: Partial<QrOptions>
  ): Promise<string> {
    const blob = await this.generate(content, options);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const qrGenerator = new QrCodeStylingGenerator();

// Helper for direct use in components
export async function generateQrDataUrl(
  content: string,
  opts?: Partial<QrOptions>
): Promise<string> {
  return qrGenerator.getDataUrl(content, opts);
}
