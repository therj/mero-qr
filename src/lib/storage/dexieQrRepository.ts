'use client';

/* eslint-disable class-methods-use-this */

import { db } from '@/db';
import { getDeviceId } from '@/lib/device';
import { TQr } from '@/types/qr';

import { QRRepository } from './qrRepository';

export class DexieQrRepository implements QRRepository {
  async get(id: string): Promise<TQr | null> {
    const qr = await db.qrs.get(id);
    return qr ?? null;
  }

  async list(): Promise<TQr[]> {
    const all = await db.qrs.toArray();
    const filtered = all.filter((qr) => !qr.deletedAt);
    filtered.sort((a, b) => b.updatedAt - a.updatedAt);
    filtered.sort(
      (a, b) =>
        Number(
          (b as unknown as { favorite?: boolean }).favorite ??
            b.isBookmark ??
            false
        ) -
        Number(
          (a as unknown as { favorite?: boolean }).favorite ??
            a.isBookmark ??
            false
        )
    );
    return filtered;
  }

  async create(record: TQr): Promise<void> {
    await db.qrs.add(record);
  }

  async update(record: TQr): Promise<void> {
    const now = Date.now();
    await db.qrs.put({
      ...record,
      updatedAt: now,
      updatedByDeviceId: getDeviceId(),
      version: (record.version ?? 1) + 1,
    });
  }

  async patch(id: string, patch: Partial<TQr>): Promise<void> {
    const existing = await db.qrs.get(id);
    if (!existing) return;
    await db.qrs.update(id, {
      ...patch,
      updatedAt: Date.now(),
      updatedByDeviceId: getDeviceId(),
      version: (existing.version ?? 1) + 1,
    } as unknown as Partial<TQr>);
  }

  async delete(id: string): Promise<void> {
    const existing = await db.qrs.get(id);
    if (!existing) return;
    await db.qrs.update(id, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
      updatedByDeviceId: getDeviceId(),
      version: (existing.version ?? 1) + 1,
    } as unknown as Partial<TQr>);
  }

  async hardDelete(id: string): Promise<void> {
    await db.qrs.delete(id);
  }

  async search(query: string): Promise<TQr[]> {
    const q = query.toLowerCase().trim();
    if (!q) return this.list();
    const all = await this.list();
    return all.filter((qr) => {
      const haystack = [
        qr.title ?? ``,
        qr.description ?? ``,
        qr.tags?.join(` `) ?? ``,
        qr.type ?? ``,
        qr.content ?? ``,
        JSON.stringify(qr.data ?? ``),
      ]
        .join(` `)
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  async clear(): Promise<void> {
    await db.qrs.clear();
  }

  async bulkPut(records: TQr[]): Promise<void> {
    await db.qrs.bulkPut(records);
  }
}

export const qrRepository = new DexieQrRepository();
