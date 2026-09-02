'use client';

/* eslint-disable class-methods-use-this, no-restricted-syntax, no-await-in-loop, prefer-destructuring */

import { db } from '@/db';
import { QRStyle, defaultStyleOptions } from '@/types/style';
import { nanoid } from 'nanoid';

import { StyleRepository } from './styleRepository';

export class DexieStyleRepository implements StyleRepository {
  async ensureDefault(): Promise<QRStyle> {
    const all = await db.styles.toArray();
    let def = all.find((s) => s.isDefault);
    if (!def && all.length === 0) {
      def = {
        id: nanoid(),
        name: `Default`,
        options: defaultStyleOptions,
        isDefault: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await db.styles.add(def);
      return def;
    }
    if (!def && all.length > 0) {
      // set first as default
      def = all[0];
      await this.setDefault(def.id);
      def.isDefault = true;
    }
    return def!;
  }

  async list(): Promise<QRStyle[]> {
    await this.ensureDefault();
    return db.styles.toArray();
  }

  async get(id: string): Promise<QRStyle | null> {
    const s = await db.styles.get(id);
    return s ?? null;
  }

  async getDefault(): Promise<QRStyle | null> {
    const all = await db.styles.toArray();
    if (all.length === 0) return this.ensureDefault();
    return all.find((s) => s.isDefault) ?? all[0] ?? null;
  }

  async create(style: QRStyle): Promise<void> {
    if (style.isDefault) {
      await db.styles
        .where(`isDefault`)
        .equals(1 as unknown as string)
        .modify({ isDefault: false } as unknown as Partial<QRStyle>);
      // Dexie boolean index workaround: update all
      const all = await db.styles.toArray();
      for (const s of all) {
        if (s.isDefault) await db.styles.update(s.id, { isDefault: false });
      }
    }
    await db.styles.add(style);
  }

  async update(style: QRStyle): Promise<void> {
    await db.styles.put({ ...style, updatedAt: Date.now() });
    if (style.isDefault) await this.setDefault(style.id);
  }

  async delete(id: string): Promise<void> {
    const s = await db.styles.get(id);
    if (!s) return;
    await db.styles.delete(id);
    if (s.isDefault) {
      const remaining = await db.styles.toArray();
      if (remaining.length > 0) await this.setDefault(remaining[0].id);
    }
  }

  async setDefault(id: string): Promise<void> {
    const all = await db.styles.toArray();
    for (const s of all) {
      await db.styles.update(s.id, { isDefault: s.id === id });
    }
  }
}

export const styleRepository = new DexieStyleRepository();
