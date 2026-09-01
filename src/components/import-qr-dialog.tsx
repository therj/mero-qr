'use client';

import { useState } from 'react';

import { TQr } from '@/types/qr';
import { QRCodeTypeEnum } from '@/constants/enums';
import { qrRepository } from '@/lib/storage/dexieQrRepository';
import { getDeviceId } from '@/lib/device';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface ImportQrDialogProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

function validateQr(obj: unknown): obj is TQr {
  if (!obj || typeof obj !== `object`) return false;
  const o = obj as Record<string, unknown>;
  if (typeof o.id !== `string` || typeof o.type !== `string` || !o.data)
    return false;
  if (!Object.values(QRCodeTypeEnum).includes(o.type as QRCodeTypeEnum))
    return false;
  return true;
}

export function ImportQrDialog({ isOpen, onToggle }: ImportQrDialogProps) {
  const [raw, setRaw] = useState(``);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleImport = async () => {
    setError(null);
    setSuccess(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      setError(`Invalid JSON: ${(e as Error).message}`);
      return;
    }
    const items: unknown[] = Array.isArray(parsed) ? parsed : [parsed];
    const valid: TQr[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const it of items) {
      if (!validateQr(it)) {
        setError(`Invalid QR object: ${JSON.stringify(it).slice(0, 120)}`);
        return;
      }
      valid.push(it as TQr);
    }
    if (valid.length === 0) {
      setError(`No valid QR found`);
      return;
    }
    try {
      const now = Date.now();
      const deviceId = getDeviceId();
      const toAdd = valid.map((q) => {
        const rawQ = q as unknown as Record<string, unknown>;
        const fav =
          (rawQ.favorite as boolean) ?? (rawQ.isBookmark as boolean) ?? false;
        const createdAtRaw = rawQ.createdAt as unknown;
        let createdAt: number;
        if (typeof createdAtRaw === `number`) {
          createdAt = createdAtRaw;
        } else if (typeof createdAtRaw === `string`) {
          createdAt = Date.parse(createdAtRaw as string) || now;
        } else {
          createdAt = now;
        }
        return {
          ...q,
          tags: (rawQ.tags as string[]) ?? [],
          favorite: fav,
          isBookmark: fav,
          createdAt,
          updatedAt: now,
          createdByDeviceId: (rawQ.createdByDeviceId as string) ?? deviceId,
          updatedByDeviceId: deviceId,
          version: (rawQ.version as number) ?? 1,
          deletedAt: (rawQ.deletedAt as number | null) ?? null,
          metadata: (rawQ.metadata as TQr[`metadata`]) ?? {
            source: `imported`,
          },
        } as TQr;
      });
      await qrRepository.bulkPut(toAdd);
      setSuccess(`Imported ${toAdd.length} QR(s)`);
      setRaw(``);
      setTimeout(() => onToggle(false), 800);
    } catch (e) {
      setError(`Import failed: ${(e as Error).message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import QR as JSON</DialogTitle>
          <DialogDescription>
            Paste a QR object or array copied via &quot;Copy as JSON&quot;. Will
            upsert by id.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Textarea
            placeholder={`{ "id": "...", "type": "Link", "data": { "url": "https://..." } }`}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={8}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
        </div>
        <DialogFooter className="sm:justify-end gap-2">
          <Button variant="ghost" onClick={() => onToggle(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!raw.trim()}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
