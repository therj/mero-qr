'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  ArrowPathIcon,
  HomeIcon,
  PlayIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  QrCodeIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import type { TQr } from '@/types/qr';
import { PlusIcon } from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';
import { qrRepository } from '@/lib/storage/dexieQrRepository';
import { useSearch } from '@/providers/search-provider';

import { parseScannedToQr } from '@/helpers/qr/parseScanned';
import { Button } from './ui/button';
import { ThemeToggle } from './theme-provider';
import AddQrModal from './add-qr-modal';
import { ImportQrDialog } from './import-qr-dialog';
import { Input } from './ui/input';

const ScanQrDialog = dynamic(
  () => import(`./scan-qr-dialog`).then((m) => m.ScanQrDialog),
  { ssr: false }
);

const deleteAllItems = () => {
  qrRepository.clear();
};

const handleExport = async () => {
  try {
    const all = await qrRepository.list();
    const blob = new Blob([JSON.stringify(all, null, 2)], {
      type: `application/json`,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement(`a`);
    a.href = url;
    a.download = `mero-qr-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error(`Export failed`, e);
  }
};

function NavBar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const isHome = usePathname() === `/`;
  const isDesign = usePathname() === `/design`;
  const isVault = isHome || isDesign;
  const baseClasses = `border-b-2 py-2 px-4 sm:px-8 lg:px-4`;

  const [isOpen, setIsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [addInitialData, setAddInitialData] = useState<TQr | null>(null);
  const { query, setQuery } = useSearch();

  const toggleDialog = (setOpen: boolean) => {
    setIsOpen(setOpen);
    if (!setOpen) setAddInitialData(null);
  };

  const handleScannedEdit = (content: string) => {
    const parsed = parseScannedToQr(content);
    setAddInitialData(parsed as unknown as TQr);
    setIsOpen(true);
  };

  useEffect(() => {
    const handler = () => {
      setAddInitialData(null);
      setIsOpen(true);
    };
    window.addEventListener(`meroqr:openAddModal`, handler);
    return () => window.removeEventListener(`meroqr:openAddModal`, handler);
  }, []);

  useEffect(() => {
    const handler = () => setIsScanOpen(true);
    window.addEventListener(`meroqr:openScan`, handler);
    return () => window.removeEventListener(`meroqr:openScan`, handler);
  }, []);

  useEffect(() => {
    const handler = () => setIsImportOpen(true);
    window.addEventListener(`meroqr:openImport`, handler);
    return () => window.removeEventListener(`meroqr:openImport`, handler);
  }, []);

  return (
    <nav
      className={cn(
        baseClasses,
        `fixed w-full z-20 top-0 start-0 border-b bg-background `,
        className
      )}
      {...props}
    >
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto">
        <Button
          variant={`ghost`}
          className="text-2xl whitespace-nowrap flex items-center px-2 py-7 rounded-none select-none"
          asChild
        >
          <Link href="/">
            <Button
              variant={`ghost`}
              className="px-1 py-0 rounded text-xl font-bold leading-none"
              asChild
            >
              <span>Mero</span>
            </Button>
            <Button
              className="bg-primary px-2 py-0 rounded text-xl font-bold leading-none"
              asChild
            >
              <span>QR</span>
            </Button>
          </Link>
        </Button>
        {isVault && (
          <div className="flex-1 flex justify-center mx-2 sm:mx-4 max-w-md relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search title, content, tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
        )}
        <div className="flex flex-row items-center justify-stretch space-x-3 md:space-x-0 rtl:space-x-reverse gap-2">
          <ThemeToggle className="order-2" />
          {isVault && (
            <Button
              size={`lg`}
              variant={`outline`}
              className="text-base p-2 hover:cursor-pointer"
              asChild
            >
              <Button
                variant={`link`}
                className="flex flex-row items-center gap-2 text-destructive hover:bg-destructive hover:bg-opacity-10"
                onClick={deleteAllItems}
                title="Clear all QRs"
              >
                <ArrowPathIcon className="w-6 h-6 px-px py-px" />
              </Button>
            </Button>
          )}
          {isVault && (
            <Button
              size={`lg`}
              variant={`outline`}
              className="text-base p-2 hover:cursor-pointer"
              asChild
            >
              <Button
                variant={`link`}
                className="flex flex-row items-center gap-2 text-primary hover:bg-primary hover:bg-opacity-10"
                onClick={() => {
                  setAddInitialData(null);
                  toggleDialog(true);
                }}
                title="Add a QR"
              >
                <PlusIcon className="w-6 h-6 px-px py-px" />
              </Button>
            </Button>
          )}
          {isVault && (
            <Button
              size={`lg`}
              variant={`outline`}
              className="text-base p-2 hover:cursor-pointer"
              asChild
            >
              <Button
                variant={`link`}
                className="flex flex-row items-center gap-2 text-primary hover:bg-primary hover:bg-opacity-10"
                onClick={() => setIsScanOpen(true)}
                title="Scan QR"
              >
                <QrCodeIcon className="w-6 h-6 px-px py-px" />
              </Button>
            </Button>
          )}
          {isVault && (
            <Button
              size={`lg`}
              variant={`outline`}
              className="text-base p-2 hover:cursor-pointer"
              asChild
            >
              <Button
                variant={`link`}
                className="flex flex-row items-center gap-2 text-primary hover:bg-primary hover:bg-opacity-10"
                onClick={() => setIsImportOpen(true)}
                title="Import QR as JSON"
              >
                <ArrowUpTrayIcon className="w-6 h-6 px-px py-px" />
              </Button>
            </Button>
          )}
          {isVault && (
            <Button
              size={`lg`}
              variant={`outline`}
              className="text-base p-2 hover:cursor-pointer"
              asChild
            >
              <Link
                href="/preferences"
                className="flex flex-row items-center gap-2 text-primary hover:bg-primary hover:bg-opacity-10 px-3 py-2"
                title="Preferences"
              >
                <Cog6ToothIcon className="w-6 h-6 px-px py-px" />
              </Link>
            </Button>
          )}
          {isVault && (
            <Button
              size={`lg`}
              variant={`outline`}
              className="text-base p-2 hover:cursor-pointer"
              asChild
            >
              <Button
                variant={`link`}
                className="flex flex-row items-center gap-2 text-primary hover:bg-primary hover:bg-opacity-10"
                onClick={handleExport}
                title="Export QRs as JSON"
              >
                <ArrowDownTrayIcon className="w-6 h-6 px-px py-px" />
              </Button>
            </Button>
          )}
          <Button
            size={`lg`}
            variant={`outline`}
            className="text-base px-2"
            asChild
          >
            <>
              {isHome && (
                <Link href="/design">
                  <div className="flex items-center flex-row gap-2">
                    <PlayIcon className="w-6 h-6 px-px py-px" />
                    <span className="sr-onlyy">Design</span>
                  </div>
                </Link>
              )}

              {!isHome && (
                <Link href="/">
                  <Button
                    size={`lg`}
                    variant={`outline`}
                    className="text-base px-2 flex flex-row items-center gap-2"
                  >
                    <HomeIcon className="w-6 h-6 px-px py-px" />
                    <span className="sr-only sm:not-sr-only">Home</span>
                  </Button>
                </Link>
              )}
            </>
          </Button>
        </div>
      </div>
      <AddQrModal
        onToggleDialog={toggleDialog}
        isOpen={isOpen}
        initialData={addInitialData}
      />
      <ImportQrDialog isOpen={isImportOpen} onToggle={setIsImportOpen} />
      <ScanQrDialog
        isOpen={isScanOpen}
        onToggle={setIsScanOpen}
        onEditScanned={handleScannedEdit}
      />
    </nav>
  );
}

export { NavBar };
