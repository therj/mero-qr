'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import React from 'react';
import { Skeleton } from '@ui/skeleton';

export function QRCardSkeleton({
  className = `shadow sm:flex`,
}: {
  className?: string;
}) {
  return (
    <Card className={cn(`flex flex-col relative max-w-full`, className)}>
      <CardHeader className="max-w-full mb-auto">
        <Skeleton className="h-[1rem] w-2/4" />

        <Skeleton className="h-5 w-3/4"></Skeleton>
      </CardHeader>
      <CardContent className="max-w-full grid gap-4">
        <div className="w-full items-center p-0 flex flex-row gap-4">
          <Skeleton className="flex-none mr-1 h-6 w-6" />
          <div className="flex-col space-y-1 w-full">
            <Skeleton className="h-[0.875rem] w-2/4" />
            <Skeleton className="h-5 w-1/4" />
          </div>
        </div>
        <Skeleton className="place-self-center mt-auto grid place-items-center w-[200px] h-[200px]" />
      </CardContent>

      <CardFooter className="w-full flex flex-row justify-between	bg-muted py-4 mb-0">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 px-2 py-2" />
          <Skeleton className="h-8 w-8 px-2 py-2" />
          <Skeleton className="h-8 w-8 px-2 py-2" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 px-2 py-2" />
          <Skeleton className="h-9 w-9 px-2 py-2" />
        </div>
      </CardFooter>
      <Skeleton className="absolute cursor-pointer px-2 py-2 top-4 right-4 h-9 w-9" />
    </Card>
  );
}

export function QRCardSeed({
  seed,
  qrCodeDataLength,
  disabled = false,
  className = `shadow sm: flex`,
  ...props
}: {
  seed: () => Promise<void>;
  disabled: boolean;
  qrCodeDataLength?: number;
  className?: string;
}) {
  const { ...cardProps } = props;

  return (
    <Card
      className={cn(`flex flex-col relative max-w-full`, className)}
      {...cardProps}
    >
      <CardHeader className="max-w-full mb-auto">
        <CardTitle className="truncate">NO QR data</CardTitle>
        <CardDescription className="truncate">Seed some data</CardDescription>
      </CardHeader>
      <CardContent className="max-w-full grid gap-4">
        <div className="w-full items-center p-0 flex flex-row gap-4">
          <Skeleton className="flex-none mr-1 h-6 w-6" />
          <div className="flex-col space-y-1">
            <p className="text-sm font-medium leading-normal line-clamp-1">
              Seed the data to start
            </p>
            <p className="text-sm text-muted-foreground truncate">
              This action will seed {qrCodeDataLength} items
            </p>
          </div>
        </div>
        <div className="place-self-center mt-auto grid place-items-center w-[200px] h-[200px] rounded-md bg-foreground/5">
          <Button size={`lg`} onClick={seed} disabled={disabled}>
            Seed Now
          </Button>
        </div>
      </CardContent>

      <CardFooter className="w-full flex flex-row justify-between	bg-muted py-4 mb-0">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 px-2 py-2" />
          <Skeleton className="h-8 w-8 px-2 py-2" />
          <Skeleton className="h-8 w-8 px-2 py-2" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 px-2 py-2" />
          <Skeleton className="h-9 w-9 px-2 py-2" />
        </div>
      </CardFooter>
      <Skeleton className="absolute cursor-pointer px-2 py-2 top-4 right-4 h-9 w-9" />
    </Card>
  );
}
