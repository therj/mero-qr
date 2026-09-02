'use client';

/* eslint-disable class-methods-use-this */

import { QRScanner } from './scanner';

export class Html5QrScanner implements QRScanner {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private html5Qr: any = null;

  private detectedHandler: ((content: string) => void) | null = null;

  private elementId: string | null = null;

  async getCameras(): Promise<{ id: string; label: string }[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-implied-eval, quotes, no-useless-concat
      const mod = await import('html5' + '-qrcode');
      const cams = await mod.Html5Qrcode.getCameras();
      return cams.map((c: { id: string; label: string }) => ({
        id: c.id,
        label: c.label,
      }));
    } catch {
      // ignore no camera
      return [];
    }
  }

  onDetected(handler: (content: string) => void): () => void {
    this.detectedHandler = handler;
    return () => {
      this.detectedHandler = null;
    };
  }

  async start(elementId: string): Promise<void> {
    this.elementId = elementId;
    const cameras = await this.getCameras();
    const cameraId = cameras[0]?.id;
    if (!cameraId) throw new Error(`No camera found`);
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, quotes, no-useless-concat
    const { Html5Qrcode } = await import('html5' + '-qrcode');
    this.html5Qr = new Html5Qrcode(elementId);
    await this.html5Qr.start(
      cameraId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
      },
      (decodedText: string) => {
        this.detectedHandler?.(decodedText);
      },
      () => {
        // ignore scan error
      }
    );
  }

  async stop(): Promise<void> {
    if (this.html5Qr) {
      try {
        await this.html5Qr.stop();
        await this.html5Qr.clear();
      } catch {
        // ignore stop error
      }
      this.html5Qr = null;
    }
  }

  async scanFile(file: File): Promise<string> {
    const tempId = `html5-qrcode-file-${Date.now()}`;
    const div = document.createElement(`div`);
    div.id = tempId;
    div.style.display = `none`;
    document.body.appendChild(div);
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, quotes, no-useless-concat
    const { Html5Qrcode } = await import('html5' + '-qrcode');
    const scanner = new Html5Qrcode(tempId);
    try {
      const result = await scanner.scanFile(file, true);
      return result;
    } finally {
      try {
        await scanner.clear();
      } catch {
        // ignore clear error
      }
      div.remove();
    }
  }
}

export const html5Scanner = new Html5QrScanner();
