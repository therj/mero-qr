'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { useState } from 'react';
import { nanoid } from 'nanoid';

import { db } from '@/db';
import { QRStyle, defaultStyleOptions } from '@/types/style';
import { styleRepository } from '@/lib/storage/dexieStyleRepository';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const dotTypes = [
  `square`,
  `dots`,
  `rounded`,
  `extra-rounded`,
  `classy`,
  `classy-rounded`,
] as const;
const cornerTypes = [`square`, `dot`, `extra-rounded`] as const;

export default function PreferencesPage() {
  const styles = useLiveQuery(() => styleRepository.list(), []);
  const [name, setName] = useState(``);
  const [dotsType, setDotsType] = useState<string>(`square`);
  const [dotsColor, setDotsColor] = useState(`#000000`);
  const [bgColor, setBgColor] = useState(`#ffffff`);
  const [cornerSquare, setCornerSquare] = useState<string>(`square`);
  const [cornerDot, setCornerDot] = useState<string>(`square`);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setName(``);
    setDotsType(`square`);
    setDotsColor(`#000000`);
    setBgColor(`#ffffff`);
    setCornerSquare(`square`);
    setCornerDot(`square`);
    setEditingId(null);
  };

  const handleSave = async () => {
    const opts = {
      ...defaultStyleOptions,
      dotsOptions: { color: dotsColor, type: dotsType as never },
      backgroundOptions: { color: bgColor },
      cornersSquareOptions: { type: cornerSquare as never },
      cornersDotOptions: { type: cornerDot as never },
    };
    if (editingId) {
      const existing = await db.styles.get(editingId);
      if (!existing) return;
      await styleRepository.update({
        ...existing,
        name: name || `Style ${editingId.slice(0, 4)}`,
        options: opts,
        updatedAt: Date.now(),
      });
    } else {
      const style: QRStyle = {
        id: nanoid(),
        name: name || `Style ${Date.now()}`,
        options: opts,
        isDefault: styles?.length === 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await styleRepository.create(style);
    }
    resetForm();
  };

  const handleEdit = (s: QRStyle) => {
    setEditingId(s.id);
    setName(s.name);
    setDotsType((s.options.dotsOptions as { type: string })?.type ?? `square`);
    setDotsColor(
      (s.options.dotsOptions as { color: string })?.color ?? `#000000`
    );
    setBgColor(
      (s.options.backgroundOptions as { color: string })?.color ?? `#ffffff`
    );
    setCornerSquare(
      (s.options.cornersSquareOptions as { type: string })?.type ?? `square`
    );
    setCornerDot(
      (s.options.cornersDotOptions as { type: string })?.type ?? `square`
    );
  };

  return (
    <main className="items-center justify-center gap-8 p-4 mx-auto max-w-screen-xl mt-16 lg:mt-20 sm:px-8 lg:px-4">
      <h1 className="text-2xl font-bold mb-4">Preferences - QR Styles</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Save multiple QR styles with one selected as default. Default is used
        for new QRs (black white square by default).
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? `Edit Style` : `Add Style`}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                placeholder="My Style"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Dots type</Label>
              <Select value={dotsType} onValueChange={setDotsType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dotTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Dots color</Label>
                <Input
                  type="color"
                  value={dotsColor}
                  onChange={(e) => setDotsColor(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Background</Label>
                <Input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Corners square</Label>
                <Select value={cornerSquare} onValueChange={setCornerSquare}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cornerTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Corners dot</Label>
                <Select value={cornerDot} onValueChange={setCornerDot}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cornerTypes.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                {editingId ? `Update` : `Add`} Style
              </Button>
              {editingId && (
                <Button variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {styles?.map((s) => (
            <Card
              key={s.id}
              className={s.isDefault ? `ring-1 ring-primary` : ``}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  {s.name} {s.isDefault && `(Default)`}
                </CardTitle>
                <div className="flex gap-2">
                  {!s.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => styleRepository.setDefault(s.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(s)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => styleRepository.delete(s.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                <div>
                  Dots: {(s.options.dotsOptions as { type: string })?.type}
                  {` `}
                  {(s.options.dotsOptions as { color: string })?.color}
                </div>
                <div>
                  BG:{` `}
                  {(s.options.backgroundOptions as { color: string })?.color}
                </div>
                <div>
                  Corners:{` `}
                  {(s.options.cornersSquareOptions as { type: string })?.type} /
                  {` `}
                  {(s.options.cornersDotOptions as { type: string })?.type}
                </div>
              </CardContent>
            </Card>
          ))}
          {styles?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No styles yet. Add one.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
