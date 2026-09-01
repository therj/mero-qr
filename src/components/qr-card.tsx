'use client';

import {
  DrawingPinFilledIcon as BookmarkedIcon,
  DrawingPinIcon as NotBookmarkedIcon,
  Share1Icon,
  TextIcon,
} from '@radix-ui/react-icons';

import {
  TrashIcon as HeroTrashIcon,
  PencilSquareIcon,
  ArrowDownIcon,
  ClipboardDocumentIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  WifiIcon,
  LinkIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleBottomCenterTextIcon,
  UserIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  TBook,
  TContact,
  TEmail,
  TLink,
  TPhone,
  TSms,
  TText,
  TQr,
  TWifi,
} from '@/types/qr';
import { QRCodeTypeEnum } from '@/constants/enums';
import { getShareText, getShareUrl } from '@/helpers/qr/shareText';
import { qrRepository } from '@/lib/storage/dexieQrRepository';
import { qrToContent } from '@/helpers/qr/toContent';
import { generateQrDataUrl, qrGenerator } from '@/lib/qr/generator';
import { getDeviceId } from '@/lib/device';
import { nanoid } from 'nanoid';

const getQrData = (type: QRCodeTypeEnum, data: TQr[`data`]) => {
  let Icon: React.ElementType;
  let typeText;
  let dataTitleText = `data.title`;
  switch (type) {
    /* eslint-disable no-case-declarations */
    case QRCodeTypeEnum.book:
      const bookData = data as TBook[`data`];
      typeText = `Book`;
      dataTitleText = bookData.title;
      if (bookData.author) {
        dataTitleText = `${dataTitleText} (${bookData.author})`;
      }
      Icon = BookOpenIcon;
      break;
    case QRCodeTypeEnum.phone:
      typeText = `Phone`;
      const phoneData = data as TPhone[`data`];
      dataTitleText = phoneData.phoneNumber;
      if (phoneData.phoneNumber) {
        dataTitleText = `${dataTitleText}`;
        if (phoneData.name) {
          dataTitleText = `${dataTitleText} (${phoneData.name})`;
        }
      }

      Icon = PhoneIcon;
      break;
    case QRCodeTypeEnum.contact:
      typeText = `Contact`;
      const contactData = data as TContact[`data`];

      dataTitleText =
        contactData.name || contactData.email || contactData.phoneNumber;

      if (contactData.company) {
        if (contactData.jobTitle) {
          dataTitleText = `${dataTitleText} (${contactData.company}, ${contactData.jobTitle})`;
        } else {
          dataTitleText = `${dataTitleText} (${contactData.company})`;
        }
      }
      Icon = UserIcon;
      break;
    case QRCodeTypeEnum.wifi:
      typeText = `WiFi`;
      const wifiData = data as TWifi[`data`];
      dataTitleText = wifiData.name;
      Icon = WifiIcon;
      break;
    case QRCodeTypeEnum.link:
      typeText = `Link`;
      const linkData = data as TLink[`data`];
      dataTitleText = linkData.url;
      Icon = LinkIcon;
      break;
    case QRCodeTypeEnum.text:
      typeText = `Text`;
      const textData = data as TText[`data`];
      dataTitleText = textData.text;
      Icon = TextIcon;
      break;
    case QRCodeTypeEnum.email:
      typeText = `Email`;
      const emailData = data as TEmail[`data`];

      if (emailData.subject) {
        dataTitleText = emailData.subject;
      }

      Icon = EnvelopeIcon;
      break;
    case QRCodeTypeEnum.sms:
      typeText = `SMS Message`;
      const smsData = data as TSms[`data`];
      dataTitleText = smsData.text || `SMS for ${smsData.to}`;
      Icon = ChatBubbleBottomCenterTextIcon;
      break;
    default:
      typeText = `Unknown`;
      Icon = EyeIcon;
    /* eslint-enable no-case-declarations */
  }

  return {
    typeText,
    Icon,
    dataTitleText,
  };
};

type QRCardProps = TQr & {
  onEdit?: (qr: TQr) => void;
  onCardClick?: (qr: TQr) => void;
};

export function QRCard({
  className = `shadow sm:flex`,
  onEdit,
  onCardClick,
  ...props
}: QRCardProps) {
  const { id, type, title, description, data, ...cardProps } = props;
  const qr = props as TQr;
  const { Icon, typeText, dataTitleText } = getQrData(type, data);
  const cardTitleText = title ?? `Untitled ${typeText ?? `Item`}`;
  const initialFav =
    (qr as unknown as { favorite?: boolean }).favorite ??
    (qr as unknown as { isBookmark?: boolean }).isBookmark ??
    false;

  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareImageCopied, setShareImageCopied] = useState(false);
  const [shareJsonCopied, setShareJsonCopied] = useState(false);
  const [optimisticBookmark, setOptimisticBookmark] = useState(initialFav);
  const [isPinAnimating, setIsPinAnimating] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>(`/qr.png`);
  const qrContent = qrToContent(qr);
  const shareText = getShareText(qr);

  useEffect(() => {
    const fav =
      (qr as unknown as { favorite?: boolean }).favorite ??
      (qr as unknown as { isBookmark?: boolean }).isBookmark ??
      false;
    setOptimisticBookmark(fav);
  }, [qr]);

  useEffect(() => {
    let cancelled = false;
    generateQrDataUrl(qrContent)
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(`/qr.png`);
      });
    return () => {
      cancelled = true;
    };
  }, [qrContent]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const BookmarkIcon = useMemo(() => {
    let IconToReturn = optimisticBookmark ? BookmarkedIcon : NotBookmarkedIcon;
    if (isHovered) {
      IconToReturn = optimisticBookmark ? NotBookmarkedIcon : BookmarkedIcon;
    }
    return IconToReturn;
  }, [isHovered, optimisticBookmark]);

  const handlePinClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !optimisticBookmark;
    setOptimisticBookmark(next);
    setIsPinAnimating(true);
    setTimeout(() => setIsPinAnimating(false), 320);
    try {
      await qrRepository.patch(id, {
        favorite: next,
        isBookmark: next,
      } as unknown as Partial<TQr>);
    } catch (err) {
      console.error(`Failed to toggle pin`, err);
      setOptimisticBookmark(!next);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await qrRepository.delete(id);
      setIsDeleteOpen(false);
    } catch (err) {
      console.error(`Failed to delete QR`, err);
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const blob = await qrGenerator.generate(qrContent);
      if (
        navigator.clipboard &&
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (window as unknown as { ClipboardItem?: unknown }).ClipboardItem
      ) {
        const ClipboardItemCtor = (
          window as unknown as { ClipboardItem: typeof ClipboardItem }
        ).ClipboardItem;
        const item = new ClipboardItemCtor({
          [blob.type || `image/png`]: blob,
        });
        await navigator.clipboard.write([item]);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(dataTitleText);
      }
    } catch (err) {
      console.error(`Failed to copy image`, err);
      try {
        await navigator.clipboard.writeText(dataTitleText);
        // eslint-disable-next-line no-empty
      } catch {}
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const blob = await qrGenerator.generate(qrContent);
      const url = URL.createObjectURL(blob);
      const a = document.createElement(`a`);
      a.href = url;
      a.download = `${cardTitleText.replace(/\s+/g, `_`)}-qr.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Failed to download`, err);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({ title: cardTitleText, text: shareText });
        return;
      } catch (err) {
        if ((err as Error).name === `AbortError`) return;
        // fallback to dialog
      }
    }
    setIsShareOpen(true);
  };

  const handleShareCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (err) {
      console.error(`Failed to share (copy)`, err);
    }
  };

  const handleShareCopyImage = async () => {
    try {
      const blob = await qrGenerator.generate(qrContent);
      if (
        navigator.clipboard &&
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (window as unknown as { ClipboardItem?: unknown }).ClipboardItem
      ) {
        const ClipboardItemCtor = (
          window as unknown as { ClipboardItem: typeof ClipboardItem }
        ).ClipboardItem;
        const item = new ClipboardItemCtor({
          [blob.type || `image/png`]: blob,
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(shareText);
      }
      setShareImageCopied(true);
      setTimeout(() => setShareImageCopied(false), 2000);
    } catch (err) {
      console.error(`Failed to copy image`, err);
      try {
        await navigator.clipboard.writeText(shareText);
        setShareImageCopied(true);
        setTimeout(() => setShareImageCopied(false), 2000);
        // eslint-disable-next-line no-empty
      } catch {}
    }
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(qr, null, 2));
      setShareJsonCopied(true);
      setTimeout(() => setShareJsonCopied(false), 2000);
    } catch (err) {
      console.error(`Failed to copy JSON`, err);
    }
  };

  const handleShareEmail = () => {
    const body = encodeURIComponent(shareText);
    const subject = encodeURIComponent(cardTitleText);
    const mailto = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailto;
  };

  const handleShareX = () => {
    const text = encodeURIComponent(shareText);
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    const win = window.open(url, `_blank`, `noopener,noreferrer`);
    if (!win) window.location.href = url;
  };

  const handleShareFacebook = () => {
    const shareUrl = getShareUrl(qr);
    const quote = encodeURIComponent(shareText);
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}&quote=${quote}`;
    const win = window.open(url, `_blank`, `noopener,noreferrer`);
    if (!win) window.location.href = url;
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(qr);
    } else {
      window.dispatchEvent(
        new CustomEvent(`meroqr:openEditModal`, { detail: { qr } })
      );
    }
  };

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const now = Date.now();
      const deviceId = getDeviceId();
      const dup: TQr = {
        ...qr,
        id: nanoid(),
        title: qr.title ? `Copy of ${qr.title}` : `Copy of ${cardTitleText}`,
        createdAt: now,
        updatedAt: now,
        createdByDeviceId: deviceId,
        updatedByDeviceId: deviceId,
        version: 1,
        deletedAt: null,
      } as TQr;
      await qrRepository.create(dup);
    } catch (err) {
      console.error(`Failed to duplicate`, err);
    }
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(qr);
    } else {
      window.dispatchEvent(
        new CustomEvent(`meroqr:openReadModal`, { detail: { qr } })
      );
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === `Enter` || e.key === ` `) {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <>
      <Card
        className={cn(
          `flex flex-col relative max-w-full cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-500 ease-out will-change-transform`,
          optimisticBookmark && `ring-1 ring-primary/20 shadow-md`,
          className
        )}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`Open ${cardTitleText}`}
        {...cardProps}
      >
        <CardHeader className="max-w-full mb-auto">
          <CardTitle className="truncate pr-8">{cardTitleText}</CardTitle>
          <CardDescription className="truncate">{description}</CardDescription>
        </CardHeader>
        <CardContent className="max-w-full grid gap-4">
          <div className="w-full items-center p-0 flex flex-row gap-4">
            <Icon className="flex-none mr-1 h-6 w-6" />
            <div className="flex-col space-y-1">
              <p className="text-sm font-medium leading-normal line-clamp-1">
                {dataTitleText}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {typeText}
              </p>
            </div>
          </div>
          {qr.tags && qr.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {qr.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-muted px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <Image
            src={qrDataUrl}
            height={200}
            width={200}
            alt={`QR Code for ${cardTitleText}`}
            className="place-self-center dark:contrast-125 dark:brightness-75 mt-auto"
            unoptimized
          />
        </CardContent>

        <CardFooter className="w-full flex flex-row justify-between	bg-muted py-4 mb-0">
          <div className="flex gap-2">
            <Button
              size={`icon`}
              variant={`ghost`}
              className="hover:text-primary px-2 py-2"
              onClick={handleDownload}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label="Download QR"
            >
              <ArrowDownIcon className="h-8 w-8" />
            </Button>
            <Button
              size={`icon`}
              variant={`ghost`}
              className="flex items-center hover:text-primary px-2 py-2"
              onClick={handleCopy}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label="Copy QR image"
              title="Copy QR image"
            >
              <ClipboardDocumentIcon className="h-8 w-8" />
            </Button>
            <Button
              size={`icon`}
              variant={`ghost`}
              className="hover:text-primary px-2 py-2"
              onClick={handleShare}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label="Share QR (copy text)"
              title="Copy text to clipboard"
            >
              <Share1Icon className="h-8 w-8" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              size={`icon`}
              variant={`ghost`}
              className="hover:text-primary px-2 py-2"
              onClick={handleEdit}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label="Edit QR"
            >
              <PencilSquareIcon className="h-8 w-8" />
            </Button>
            <Button
              size={`icon`}
              variant={`ghost`}
              className="hover:text-primary px-2 py-2"
              onClick={handleDuplicate}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label="Duplicate QR"
              title="Duplicate"
            >
              <DocumentDuplicateIcon className="h-8 w-8" />
            </Button>
            <Button
              size={`icon`}
              variant={`ghost`}
              className="hover:text-destructive px-2 py-2"
              onClick={handleDelete}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              aria-label="Delete QR"
            >
              <HeroTrashIcon className="h-8 w-8" />
            </Button>
          </div>
        </CardFooter>
        {React.createElement(BookmarkIcon, {
          className: cn(
            `absolute cursor-pointer px-2 py-2 top-4 right-4 h-9 w-9 hover:text-primary will-change-transform transition-all duration-300 ease-out`,
            isPinAnimating && `scale-[1.25] rotate-[12deg]`,
            !isPinAnimating && `scale-100 rotate-0`,
            optimisticBookmark && `text-primary`
          ),
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
          onClick: handlePinClick,
          [`aria-label`]: optimisticBookmark ? `Unpin QR` : `Pin QR`,
          role: `button`,
          tabIndex: 0,
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === `Enter` || e.key === ` `) {
              e.preventDefault();
              handlePinClick(e as unknown as React.MouseEvent);
            }
          },
        } as unknown as Record<string, unknown>)}
      </Card>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent
          className="sm:max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Delete QR?</DialogTitle>
            <DialogDescription>
              Delete &quot;{cardTitleText}&quot;? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent
          className="sm:max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Share &quot;{cardTitleText}&quot;</DialogTitle>
            <DialogDescription>Choose how to share this QR.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            <Button variant="outline" onClick={handleShareCopyImage}>
              {shareImageCopied ? `Image copied!` : `Copy image`}
            </Button>
            <Button variant="outline" onClick={handleShareCopy}>
              {shareCopied ? `Copied!` : `Copy text (type-specific)`}
            </Button>
            <Button variant="outline" onClick={handleCopyJson}>
              {shareJsonCopied ? `JSON copied!` : `Copy as JSON`}
            </Button>
            <Button variant="outline" onClick={handleShareEmail}>
              Share via Email
            </Button>
            <Button variant="outline" onClick={handleShareX}>
              Share on X
            </Button>
            <Button variant="outline" onClick={handleShareFacebook}>
              Share on Facebook
            </Button>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button variant="ghost" onClick={() => setIsShareOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
