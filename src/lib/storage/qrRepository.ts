import { TQr } from '@/types/qr';

export interface QRRepository {
  get(id: string): Promise<TQr | null>;
  list(): Promise<TQr[]>;
  create(record: TQr): Promise<void>;
  update(record: TQr): Promise<void>;
  patch(id: string, patch: Partial<TQr>): Promise<void>;
  delete(id: string): Promise<void>; // soft delete per §15
  hardDelete(id: string): Promise<void>;
  search(query: string): Promise<TQr[]>;
  clear(): Promise<void>;
  bulkPut(records: TQr[]): Promise<void>;
}
