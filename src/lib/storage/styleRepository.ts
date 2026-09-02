import { QRStyle } from '@/types/style';

export interface StyleRepository {
  list(): Promise<QRStyle[]>;
  get(id: string): Promise<QRStyle | null>;
  getDefault(): Promise<QRStyle | null>;
  create(style: QRStyle): Promise<void>;
  update(style: QRStyle): Promise<void>;
  delete(id: string): Promise<void>;
  setDefault(id: string): Promise<void>;
}
