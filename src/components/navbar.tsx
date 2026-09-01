'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  ArrowPathIcon,
  HomeIcon,
  PlayIcon,
  ArrowUpTrayIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { PlusIcon } from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';
import { qrRepository } from '@/lib/storage/dexieQrRepository';
import { useSearch } from '@/providers/search-provider';

import { Button } from './ui/button';
import { ThemeToggle } from './theme-provider';
import AddQrModal from './add-qr-modal';
import { ImportQrDialog } from './import-qr-dialog';
import { Input } from './ui/input';

const deleteAllItems = () => {
  qrRepository.clear();
};

function NavBar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const isHome = usePathname() === `/`;
  const isDesign = usePathname() === `/design`;
  const isVault = isHome || isDesign;
  const baseClasses = `border-b-2 py-2 px-4 sm:px-8 lg:px-4`;

  const [isOpen, setIsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const { query, setQuery } = useSearch();

  const toggleDialog = (setOpen: boolean) => {
    setIsOpen(setOpen);
  };

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener(`meroqr:openAddModal`, handler);
    return () => window.removeEventListener(`meroqr:openAddModal`, handler);
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
                onClick={() => toggleDialog(true)}
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
                onClick={() => setIsImportOpen(true)}
                title="Import QR as JSON"
              >
                <ArrowUpTrayIcon className="w-6 h-6 px-px py-px" />
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
      <AddQrModal onToggleDialog={toggleDialog} isOpen={isOpen} />
      <ImportQrDialog isOpen={isImportOpen} onToggle={setIsImportOpen} />
    </nav>
  );
}

export { NavBar };
