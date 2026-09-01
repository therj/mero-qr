'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { NetworkTypeEnum, QRCodeTypeEnum } from '@/constants/enums';
import { createQrFromFormValues } from '@/helpers/qr/createQr';
import { getQrSchema, QrFormValues } from '@/lib/validations/qr';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { db } from '@/db';

interface QrFormProps {
  type: QRCodeTypeEnum | null;
  onSuccess: () => void;
}

function getDefaultValues(type: QRCodeTypeEnum | null): Partial<QrFormValues> {
  const base = {
    title: ``,
    description: ``,
    isBookmark: false,
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

export function QrForm({ type, onSuccess }: QrFormProps) {
  const schema = type ? getQrSchema(type) : null;

  const form = useForm<QrFormValues>({
    resolver: schema ? (zodResolver(schema as never) as never) : undefined,
    defaultValues: getDefaultValues(type) as never,
    // re-validate on change for better UX
    mode: `onChange`,
  });

  useEffect(() => {
    form.reset(getDefaultValues(type) as never);
  }, [type, form]);

  if (!type || !schema) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        Select a QR type to fill the form.
      </p>
    );
  }

  const onSubmit = async (values: QrFormValues) => {
    const qr = createQrFromFormValues(values);
    await db.qrs.add(qr);
    form.reset(getDefaultValues(type) as never);
    onSuccess();
  };

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
                  {...field}
                  value={field.value ?? ``}
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
                />
              </FormControl>
              <FormLabel className="font-normal cursor-pointer">
                Pin this QR
              </FormLabel>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={!form.formState.isValid && form.formState.isSubmitted}
        >
          Add QR
        </Button>
      </form>
    </Form>
  );
}
