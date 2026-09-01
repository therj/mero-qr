'use client';

import { useLiveQuery } from 'dexie-react-hooks';

import { cn } from '@/lib/utils';
import qrCodeSeedData from '@/constants/qr/seedData';
import { useEffect, useMemo, useState } from 'react';
import { TQr } from '@/types/qr';
import { qrRepository } from '@/lib/storage/dexieQrRepository';
import { useSearch } from '@/providers/search-provider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { QRCodeTypeEnum } from '@/constants/enums';
import { QRCard } from './qr-card';
import ExtraCards from './extra-cards.temp';
import { QRCardSeed, QRCardSkeleton } from './skeleton-qr-card';
import AddQrModal from './add-qr-modal';

interface cardListProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const CardList: React.FC<cardListProps> = ({ className }) => {
  const [loading, setLoading] = useState(true);
  const [editQr, setEditQr] = useState<TQr | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [readQr, setReadQr] = useState<TQr | null>(null);
  const [isReadOpen, setIsReadOpen] = useState(false);
  const { query } = useSearch();
  const [filterType, setFilterType] = useState<string>(`all`);
  const [showFavoriteOnly, setShowFavoriteOnly] = useState(false);
  const [sortBy, setSortBy] = useState<`updated` | `created` | `alpha`>(
    `updated`
  );

  const idbQrs = useLiveQuery(async () => {
    try {
      if (query.trim()) {
        return qrRepository.search(query);
      }
      return qrRepository.list();
    } catch (error) {
      console.error(`🚀 Unable to fetch db.qrs in card-list`, error);
      return [];
    }
  }, [query]);

  const filteredQrs = useMemo(() => {
    if (!idbQrs) return idbQrs;
    let out = [...idbQrs];
    if (filterType !== `all`) {
      out = out.filter((qr) => qr.type === filterType);
    }
    if (showFavoriteOnly) {
      out = out.filter(
        (qr) =>
          (qr as unknown as { favorite?: boolean }).favorite ??
          qr.isBookmark ??
          false
      );
    }
    if (sortBy === `alpha`) {
      out.sort((a, b) => (a.title ?? ``).localeCompare(b.title ?? ``));
    } else if (sortBy === `created`) {
      out.sort((a, b) => b.createdAt - a.createdAt);
    } else {
      // updated is default, already sorted by updatedAt desc in repo, but ensure
      out.sort((a, b) => b.updatedAt - a.updatedAt);
      // keep favorite on top within updated sort is already done in repo, but re-apply for filtered
      out.sort(
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
    }
    return out;
  }, [idbQrs, filterType, showFavoriteOnly, sortBy]);

  useEffect(() => {
    if (idbQrs) {
      setLoading(false);
    }
  }, [idbQrs]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { qr: TQr } | undefined;
      if (detail?.qr) {
        setEditQr(detail.qr);
        setIsEditOpen(true);
      }
    };
    window.addEventListener(`meroqr:openEditModal`, handler as EventListener);
    return () =>
      window.removeEventListener(
        `meroqr:openEditModal`,
        handler as EventListener
      );
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { qr: TQr } | undefined;
      if (detail?.qr) {
        setReadQr(detail.qr);
        setIsReadOpen(true);
      }
    };
    window.addEventListener(`meroqr:openReadModal`, handler as EventListener);
    return () =>
      window.removeEventListener(
        `meroqr:openReadModal`,
        handler as EventListener
      );
  }, []);

  const handleEdit = (qr: TQr) => {
    setEditQr(qr);
    setIsEditOpen(true);
  };

  const toggleEditDialog = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) setEditQr(null);
  };

  const toggleReadDialog = (open: boolean) => {
    setIsReadOpen(open);
    if (!open) setReadQr(null);
  };

  const handleCardClick = (qr: TQr) => {
    setReadQr(qr);
    setIsReadOpen(true);
  };

  const seed = async () => {
    try {
      await qrRepository.bulkPut(qrCodeSeedData);
    } catch (error) {
      console.error(`🚀 Seeding failed, bulkPut:`, error);
    }
  };

  return (
    <div className={cn(`mb-6 lg:mb-16`, className)}>
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {Object.values(QRCodeTypeEnum).map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as never)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Recently updated</SelectItem>
            <SelectItem value="created">Recently created</SelectItem>
            <SelectItem value="alpha">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="fav-filter"
            checked={showFavoriteOnly}
            onCheckedChange={(v) => setShowFavoriteOnly(v === true)}
          />
          <Label htmlFor="fav-filter" className="text-sm">
            Favorites only
          </Label>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-8">
        {/* No data, seed me please */}
        {!loading && !filteredQrs?.length && !query && (
          <QRCardSeed
            seed={seed}
            disabled={loading}
            qrCodeDataLength={qrCodeSeedData.length}
          />
        )}
        {!loading &&
          filteredQrs?.length === 0 &&
          (query || filterType !== `all` || showFavoriteOnly) && (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No QRs match filters.
            </div>
          )}

        {/* loading data from indexedDB */}
        {loading &&
          Array.from({ length: 6 }).map((_, i) => <QRCardSkeleton key={i} />)}

        {filteredQrs?.map((qrCode) => (
          <QRCard
            key={qrCode.id}
            {...qrCode}
            onEdit={handleEdit}
            onCardClick={handleCardClick}
          />
        ))}

        {/* 4 extra cards */}
        <ExtraCards />
      </div>
      <AddQrModal
        isOpen={isEditOpen}
        onToggleDialog={toggleEditDialog}
        initialData={editQr}
      />
      <AddQrModal
        isOpen={isReadOpen}
        onToggleDialog={toggleReadDialog}
        initialData={readQr}
        readOnly
      />
    </div>
  );
};

export default CardList;
