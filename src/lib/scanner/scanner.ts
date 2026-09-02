export interface QRScanner {
  start(elementId: string): Promise<void>;
  stop(): Promise<void>;
  onDetected(handler: (content: string) => void): () => void;
  scanFile(file: File): Promise<string>;
  getCameras(): Promise<{ id: string; label: string }[]>;
}
