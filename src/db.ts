'use client';

import Dexie, { Table } from 'dexie';
import { TQr } from '@/types/qr';

export class MySubClassedDexie extends Dexie {
  qrs!: Table<TQr>;

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
  }
}

export const db = new MySubClassedDexie();
