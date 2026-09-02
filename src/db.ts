'use client';

import Dexie, { Table } from 'dexie';
import { TQr } from '@/types/qr';
import { QRStyle } from '@/types/style';

export class MySubClassedDexie extends Dexie {
  qrs!: Table<TQr>;

  styles!: Table<QRStyle>;

  constructor() {
    super(`mero_qr_idb`, { autoOpen: true });
    this.version(1).stores({
      qrs: `id, type, title, description, isBookmark, *createdAt, *updatedAt, data`,
    });
    // v2: spec QRCodeRecord - wipe old data (alpha, manual migrate)
    this.version(2)
      .stores({
        qrs: `id, type, title, description, favorite, *createdAt, *updatedAt, *tags, *version, *deletedAt, data, content`,
      })
      .upgrade(async (tx) => {
        await tx.table(`qrs`).clear();
      });
    this.version(3).stores({
      styles: `id, name, isDefault, *createdAt, *updatedAt`,
    });
  }
}

export const db = new MySubClassedDexie();
