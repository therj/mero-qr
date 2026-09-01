'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';

import { NetworkTypeEnum, QRCodeTypeEnum } from '@/constants/enums';
import {
  applyFormValuesToQr,
  createQrFromFormValues,
  qrToFormValues,
} from '@/helpers/qr/createQr';
import { getQrSchema, QrFormValues } from '@/lib/validations/qr';
import { TQr } from '@/types/qr';
import { qrToContent } from '@/helpers/qr/toContent';
import { generateQrDataUrl } from '@/lib/qr/generator';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/ui/tag-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { qrRepository } from '@/lib/storage/dexieQrRepository';

interface QrFormProps {
  type: QRCodeTypeEnum | null;
  onSuccess: () => void;
  initialData?: TQr | null;
  submitLabel?: string;
  readOnly?: boolean;
  onEdit?: () => void;
}

function getDefaultValues(type: QRCodeTypeEnum | null): Partial<QrFormValues> {
  const base = {
    title: ``,
    description: ``,
    isBookmark: false,
    tags: [] as string[],
  };
  if (!type) return { ...base } as Partial<QrFormValues>;
  switch (type) {
    case QRCodeTypeEnum.link:
      return { ...base, type, url: `` } as Partial<QrFormValues>;
    case QRCodeTypeEnum.text:
      return { ...base, type, text: `` } as Partial<QrFormValues>;
    case QRCodeTypeEnum.wifi:
      return {
        ...base,
        type,
        name: ``,
        networkType: NetworkTypeEnum.wpa_wpa2,
        password: ``,
      } as Partial<QrFormValues>;
    case QRCodeTypeEnum.email:
      return {
        ...base,
        type,
        to: ``,
        cc: ``,
        subject: ``,
        body: ``,
      } as Partial<QrFormValues>;
    case QRCodeTypeEnum.phone:
      return {
        ...base,
        type,
        phoneNumber: ``,
        name: ``,
        email: ``,
      } as Partial<QrFormValues>;
    case QRCodeTypeEnum.contact:
      return {
        ...base,
        type,
        name: ``,
        phoneNumber: ``,
        email: ``,
        company: ``,
        jobTitle: ``,
      } as Partial<QrFormValues>;
    case QRCodeTypeEnum.sms:
      return {
        ...base,
        type,
        to: ``,
        text: ``,
      } as Partial<QrFormValues>;
    case QRCodeTypeEnum.book:
      return {
        ...base,
        type,
        bookTitle: ``,
        author: ``,
        isbn13: ``,
      } as Partial<QrFormValues>;
    default:
      return { ...base } as Partial<QrFormValues>;
  }
}

export function QrForm({
  type,
  onSuccess,
  initialData,
  submitLabel,
  readOnly = false,
  onEdit,
}: QrFormProps) {
  const schema = type ? getQrSchema(type) : null;

  const form = useForm<QrFormValues>({
    resolver: schema ? (zodResolver(schema as never) as never) : undefined,
    defaultValues: (initialData
      ? qrToFormValues(initialData)
      : getDefaultValues(type)) as never,
    mode: `onChange`,
  });

  useEffect(() => {
    if (initialData) {
      form.reset(qrToFormValues(initialData) as never);
    } else {
      form.reset(getDefaultValues(type) as never);
    }
  }, [type, initialData, form]);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const watched = form.watch();
  // preview for edit/create
  useEffect(() => {
    if (readOnly) return;
    const vals = form.getValues() as QrFormValues & Record<string, unknown>;
    if (!vals.type) {
      setPreviewUrl(null);
      return;
    }
    try {
      const tmp = createQrFromFormValues(vals as QrFormValues);
      const content = qrToContent(tmp);
      if (!content) {
        setPreviewUrl(null);
        return;
      }
      generateQrDataUrl(content)
        .then(setPreviewUrl)
        .catch(() => setPreviewUrl(null));
    } catch {
      setPreviewUrl(null);
    }
  }, [watched, readOnly, form]);

  // preview for readOnly (from initialData)
  const [readPreviewUrl, setReadPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!readOnly || !initialData) return;
    const content = qrToContent(initialData);
    if (!content) return;
    generateQrDataUrl(content)
      .then(setReadPreviewUrl)
      .catch(() => setReadPreviewUrl(null));
  }, [readOnly, initialData]);

  if (!type || !schema) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        Select a QR type to fill the form.
      </p>
    );
  }

  const onSubmit = async (values: QrFormValues) => {
    if (readOnly) return;
    if (initialData) {
      const updated = applyFormValuesToQr(initialData, values);
      await qrRepository.update(updated);
    } else {
      const qr = createQrFromFormValues(values);
      await qrRepository.create(qr);
    }
    form.reset(
      (initialData
        ? qrToFormValues(
            initialData.type === values.type
              ? applyFormValuesToQr(initialData, values)
              : (values as unknown as TQr)
          )
        : getDefaultValues(type)) as never
    );
    onSuccess();
  };

  if (readOnly) {
    const values = (
      initialData ? qrToFormValues(initialData) : form.getValues()
    ) as QrFormValues & Record<string, unknown>;
    const displayRow = (label: string, value?: string) => (
      <div className="grid grid-cols-3 gap-2 py-1 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="col-span-2 font-medium break-words">
          {value && String(value).trim() ? String(value) : `—`}
        </span>
      </div>
    );
    return (
      <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
        <p className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded flex items-center justify-between gap-2">
          <span>
            Read-only view. Use the card&apos;s edit button to modify.
          </span>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="underline text-primary hover:text-primary/80 shrink-0 font-medium"
            >
              Edit
            </button>
          )}
        </p>
        {readPreviewUrl && (
          <div className="flex justify-center py-2">
            <Image
              src={readPreviewUrl}
              alt="QR preview"
              width={200}
              height={200}
              unoptimized
              className="rounded border bg-white p-2"
            />
          </div>
        )}
        <div className="divide-y rounded-md border p-3">
          {displayRow(`Title`, values.title as string)}
          {displayRow(`Description`, values.description as string)}
          {displayRow(`Tags`, (values.tags as unknown as string[])?.join(`, `))}
          {displayRow(
            `Pinned`,
            (values.isBookmark as unknown as boolean) ||
              (values.favorite as unknown as boolean)
              ? `Yes`
              : `No`
          )}
          {initialData &&
            displayRow(
              `Created`,
              new Date(initialData.createdAt).toLocaleString()
            )}
          {initialData &&
            displayRow(
              `Updated`,
              new Date(initialData.updatedAt).toLocaleString()
            )}
          {type === QRCodeTypeEnum.link &&
            displayRow(`URL`, values.url as string)}
          {type === QRCodeTypeEnum.text &&
            displayRow(`Text`, values.text as string)}
          {type === QRCodeTypeEnum.wifi && (
            <>
              {displayRow(`Network`, values.name as string)}
              {displayRow(`Security`, values.networkType as string)}
              {(values.networkType as string) !== NetworkTypeEnum.open &&
                displayRow(`Password`, `••••••••`)}
            </>
          )}
          {type === QRCodeTypeEnum.email && (
            <>
              {displayRow(`To`, values.to as string)}
              {displayRow(`CC`, values.cc as string)}
              {displayRow(`Subject`, values.subject as string)}
              {displayRow(`Body`, values.body as string)}
            </>
          )}
          {type === QRCodeTypeEnum.phone && (
            <>
              {displayRow(`Phone`, values.phoneNumber as string)}
              {displayRow(`Name`, values.name as string)}
              {displayRow(`Email`, values.email as string)}
            </>
          )}
          {type === QRCodeTypeEnum.contact && (
            <>
              {displayRow(`Name`, values.name as string)}
              {displayRow(`Phone`, values.phoneNumber as string)}
              {displayRow(`Email`, values.email as string)}
              {displayRow(`Company`, values.company as string)}
              {displayRow(`Job Title`, values.jobTitle as string)}
            </>
          )}
          {type === QRCodeTypeEnum.sms && (
            <>
              {displayRow(`To`, values.to as string)}
              {displayRow(`Message`, values.text as string)}
            </>
          )}
          {type === QRCodeTypeEnum.book && (
            <>
              {displayRow(`Book Title`, values.bookTitle as string)}
              {displayRow(`Author`, values.author as string)}
              {displayRow(`ISBN-13`, values.isbn13 as string)}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit as never)}
        className="space-y-4 max-h-[45vh] overflow-y-auto pr-1"
      >
        {/* Common fields */}
        <FormField
          control={form.control as never}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="My QR title"
                  disabled={readOnly}
                  {...field}
                  value={field.value ?? ``}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control as never}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Short description"
                  disabled={readOnly}
                  {...field}
                  value={field.value ?? ``}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control as never}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (optional)</FormLabel>
              <FormControl>
                <TagInput
                  value={(field.value as unknown as string[]) ?? []}
                  onChange={field.onChange}
                  placeholder="home, work, personal (comma or Enter)"
                  disabled={readOnly}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type-specific fields */}
        {type === QRCodeTypeEnum.link && (
          <FormField
            control={form.control as never}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com"
                    disabled={readOnly}
                    {...field}
                    value={field.value ?? ``}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {type === QRCodeTypeEnum.text && (
          <FormField
            control={form.control as never}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter text"
                    disabled={readOnly}
                    {...field}
                    value={field.value ?? ``}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {type === QRCodeTypeEnum.wifi && (
          <>
            <FormField
              control={form.control as never}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Network name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="MyWifi"
                      disabled={readOnly}
                      {...field}
                      value={field.value ?? ``}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as never}
              name="networkType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Security</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={readOnly}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NetworkTypeEnum.open}>Open</SelectItem>
                      <SelectItem value={NetworkTypeEnum.wep}>WEP</SelectItem>
                      <SelectItem value={NetworkTypeEnum.wpa_wpa2}>
                        WPA/WPA2
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {(form.watch(
              `networkType` as never
            ) as unknown as NetworkTypeEnum) !== NetworkTypeEnum.open && (
              <FormField
                control={form.control as never}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password *</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={readOnly}
                        {...field}
                        value={field.value ?? ``}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}

        {type === QRCodeTypeEnum.email && (
          <>
            <FormField
              control={form.control as never}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="to@example.com"
                      disabled={readOnly}
                      {...field}
                      value={field.value ?? ``}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as never}
              name="cc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CC</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="cc@example.com"
                      disabled={readOnly}
                      {...field}
                      value={field.value ?? ``}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as never}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Subject"
                      disabled={readOnly}
                      {...field}
                      value={field.value ?? ``}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as never}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Email body"
                      disabled={readOnly}
                      {...field}
                      value={field.value ?? ``}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {type === QRCodeTypeEnum.phone && (
          <>
            <FormField
              control={form.control as never}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+977 98xxxxxxxx"
                      disabled={readOnly}
                      {...field}
                      value={field.value ?? ``}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as never}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Full name"
                      disabled={readOnly}
                      {...field}
                      value={field.value ?? ``}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as never}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email@example.com"
                      disabled={readOnly}
                      {...field}
                      value={field.value ?? ``}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {type === QRCodeTypeEnum.contact && (
          <>
            <FormField
              control={form.control as never}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      disabled={readOnly}
                      {...field}
                      value={field.value ?? ``}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as never}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+977..."
                      disabled={readOnly}
                      {...field}
                      value={field.value ?? ``}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as never}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email@example.com"
                      disabled={readOnly}
                      {...field}
                      value={field.value ?? ``}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as never}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Acme Inc."
                      disabled={readOnly}
                      {...field}
                      value={field.value ?? ``}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as never}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="CEO"
                      disabled={readOnly}
                      {...field}
                      value={field.value ?? ``}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {type === QRCodeTypeEnum.sms && (
          <>
            <FormField
              control={form.control as never}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Phone number"
                      disabled={readOnly}
                      {...field}
                      value={field.value ?? ``}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as never}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="SMS text"
                      disabled={readOnly}
                      {...field}
                      value={field.value ?? ``}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {type === QRCodeTypeEnum.book && (
          <>
            <FormField
              control={form.control as never}
              name="bookTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Book title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="The Abominable"
                      disabled={readOnly}
                      {...field}
                      value={field.value ?? ``}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as never}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Dan Simmons"
                      disabled={readOnly}
                      {...field}
                      value={field.value ?? ``}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control as never}
              name="isbn13"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ISBN-13</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="9780316198837"
                      disabled={readOnly}
                      {...field}
                      value={field.value ?? ``}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control as never}
          name="isBookmark"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-2 space-y-0 py-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={readOnly}
                />
              </FormControl>
              <FormLabel className="font-normal cursor-pointer">
                Pin this QR
              </FormLabel>
            </FormItem>
          )}
        />

        {previewUrl && (
          <div className="flex flex-col items-center gap-1 py-2 border rounded-md bg-muted/20">
            <p className="text-xs text-muted-foreground">Preview</p>
            <Image
              src={previewUrl}
              alt="QR preview"
              width={160}
              height={160}
              unoptimized
              className="rounded bg-white p-1"
            />
          </div>
        )}

        {!readOnly && (
          <Button
            type="submit"
            className="w-full"
            disabled={!form.formState.isValid && form.formState.isSubmitted}
          >
            {submitLabel ?? (initialData ? `Update QR` : `Add QR`)}
          </Button>
        )}
      </form>
    </Form>
  );
}
