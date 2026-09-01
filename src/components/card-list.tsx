'use client';

import { useLiveQuery } from 'dexie-react-hooks';

import { cn } from '@/lib/utils';
import qrCodeSeedData from '@/constants/qr/seedData';
import { useEffect, useState } from 'react';
import { TQr } from '@/types/qr';
import { qrRepository } from '@/lib/storage/dexieQrRepository';
import { useSearch } from '@/providers/search-provider';
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
    <div
      className={cn(
        `mb-6 lg:mb-16 grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-8`,
        className
      )}
    >
      {/* No data, seed me please */}
      {!loading && !idbQrs?.length && (
        <QRCardSeed
          seed={seed}
          disabled={loading}
          qrCodeDataLength={qrCodeSeedData.length}
        />
      )}

      {/* loading data from indexedDB */}
      {loading &&
        Array.from({ length: 6 }).map((_, i) => <QRCardSkeleton key={i} />)}

      {idbQrs?.map((qrCode) => (
        <QRCard
          key={qrCode.id}
          {...qrCode}
          onEdit={handleEdit}
          onCardClick={handleCardClick}
        />
      ))}

      {/* 4 extra cards */}
      <ExtraCards />
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
