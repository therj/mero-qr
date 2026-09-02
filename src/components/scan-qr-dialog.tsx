'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { parseScannedToQr } from '@/helpers/qr/parseScanned';
import { detectType } from '@/helpers/qr/detectType';
import { qrRepository } from '@/lib/storage/dexieQrRepository';
import type { TQr } from '@/types/qr';

interface ScanQrDialogProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  onEditScanned?: (content: string) => void;
}

export function ScanQrDialog({
  isOpen,
  onToggle,
  onEditScanned,
}: ScanQrDialogProps) {
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [decoded, setDecoded] = useState<string | null>(null);
  const [pasteValue, setPasteValue] = useState(``);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    setError(null);
    setPermissionDenied(false);
    try {
      const { html5Scanner: scanner } = await import(
        `@/lib/scanner/html5Scanner`
      );
      const cams = await scanner.getCameras();
      if (cams.length === 0) {
        setPermissionDenied(true);
        setError(`No camera found. Use upload or paste.`);
        return;
      }
      setScanning(true);
      scanner.onDetected((content) => {
        setDecoded(content);
        scanner.stop().catch(() => {});
        setScanning(false);
      });
      await scanner.start(`qr-reader`);
    } catch (e) {
      const msg = (e as Error).message ?? ``;
      if (
        msg.toLowerCase().includes(`permission`) ||
        msg.toLowerCase().includes(`not allowed`)
      ) {
        setPermissionDenied(true);
        setError(
          `Could not get access to camera. Please allow camera in browser settings.`
        );
      } else {
        setError(msg || `Could not start camera. Use upload or paste.`);
        setPermissionDenied(true);
      }
      setScanning(false);
    }
  };

  const stopCamera = async () => {
    try {
      const { html5Scanner: scanner } = await import(
        `@/lib/scanner/html5Scanner`
      );
      await scanner.stop();
    } catch {
      // ignore stop error
    }
    setScanning(false);
  };

  useEffect(() => {
    if (isOpen) {
      setDecoded(null);
      setPasteValue(``);
      setError(null);
      setPermissionDenied(false);
      // try to start camera, but don't block if denied
      startCamera();
      // listen for permission change to auto-retry
      let perm: PermissionStatus | null = null;
      if (typeof navigator !== `undefined` && navigator.permissions) {
        navigator.permissions
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .query({ name: `camera` as any })
          .then((p) => {
            perm = p;
            const handler = () => {
              if (p.state === `granted` && !decoded && !scanning) {
                startCamera();
              }
            };
            p.addEventListener(`change`, handler);
          })
          .catch(() => {
            // ignore permission query error
          });
      }
      return () => {
        if (perm) {
          try {
            perm.onchange = null;
          } catch {
            // ignore
          }
        }
        stopCamera();
      };
    }
    stopCamera();
    setDecoded(null);
    return undefined;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const { html5Scanner: scanner } = await import(
        `@/lib/scanner/html5Scanner`
      );
      const result = await scanner.scanFile(file);
      setDecoded(result);
    } catch (err) {
      setError((err as Error).message || `Could not decode image. Try paste.`);
    }
  };

  const handlePasteScan = () => {
    if (!pasteValue.trim()) {
      setError(`Paste content first`);
      return;
    }
    setDecoded(pasteValue.trim());
  };

  const handleSave = async () => {
    if (!decoded) return;
    const parsed = parseScannedToQr(decoded);
    const qr = {
      ...parsed,
    } as unknown as TQr;
    await qrRepository.create(qr as TQr);
    onToggle(false);
    setDecoded(null);
  };

  const handleCopy = async () => {
    if (!decoded) return;
    await navigator.clipboard.writeText(decoded);
  };

  const handleOpen = () => {
    if (!decoded) return;
    const t = decoded.trim();
    if (/^https?:\/\//i.test(t))
      window.open(t, `_blank`, `noopener,noreferrer`);
    else if (/^mailto:/i.test(t)) window.location.href = t;
    else
      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(t)}`,
        `_blank`
      );
  };

  const handleEdit = () => {
    if (!decoded) return;
    onEditScanned?.(decoded);
    onToggle(false);
  };

  const detectedType = decoded ? detectType(decoded) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scan QR</DialogTitle>
          <DialogDescription>
            {decoded ? `Decoded content` : `Point camera at QR or upload image`}
          </DialogDescription>
        </DialogHeader>

        {!decoded ? (
          <div className="grid gap-4 py-2">
            <div
              id="qr-reader"
              className="w-full min-h-[240px] bg-muted rounded-md overflow-hidden"
            />
            {permissionDenied && (
              <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                Could not get access to camera. Please allow camera in browser
                settings. Use upload or paste below.
              </p>
            )}
            {error && !permissionDenied && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {scanning && (
              <p className="text-sm text-muted-foreground">Scanning...</p>
            )}

            <div className="grid gap-2">
              <p className="text-sm font-medium">Upload QR image</p>
              <Input type="file" accept="image/*" onChange={handleFile} />
            </div>

            <div className="grid gap-2">
              <p className="text-sm font-medium">Or paste content</p>
              <Textarea
                placeholder="Paste decoded content or any text"
                value={pasteValue}
                onChange={(e) => setPasteValue(e.target.value)}
                rows={3}
              />
              <Button
                variant="outline"
                onClick={handlePasteScan}
                disabled={!pasteValue.trim()}
              >
                Use pasted content
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 py-2">
            <div className="rounded-md border p-3 bg-muted/20">
              <p className="text-xs text-muted-foreground mb-1">
                Type: {detectedType}
              </p>
              <p className="text-sm break-words font-mono bg-background p-2 rounded border">
                {decoded}
              </p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={handleCopy}>
                Copy
              </Button>
              <Button variant="outline" onClick={handleOpen}>
                Open
              </Button>
              <Button variant="outline" onClick={handleEdit}>
                Edit
              </Button>
            </div>
            <Button variant="ghost" onClick={() => setDecoded(null)}>
              Discard & Scan again
            </Button>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onToggle(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
