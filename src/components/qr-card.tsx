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
import React, { useMemo, useState } from 'react';
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
import { db } from '@/db';

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
  const { id, type, title, description, data, isBookmark, ...cardProps } =
    props;
  const qr = props as TQr;
  const { Icon, typeText, dataTitleText } = getQrData(type, data);
  const cardTitleText = title ?? `Untitled ${typeText ?? `Item`}`;

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const BookmarkIcon = useMemo(() => {
    let IconToReturn = isBookmark ? BookmarkedIcon : NotBookmarkedIcon;
    if (isHovered) {
      IconToReturn = isBookmark ? NotBookmarkedIcon : BookmarkedIcon;
    }
    return IconToReturn;
  }, [isHovered, isBookmark]);

  const handlePinClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await db.qrs.update(id, {
        isBookmark: !isBookmark,
        updatedAt: new Date().toISOString(),
      } as Partial<TQr>);
    } catch (err) {
      console.error(`Failed to toggle pin`, err);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await db.qrs.delete(id);
    } catch (err) {
      console.error(`Failed to delete QR`, err);
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/qr.png`);
      const blob = await res.blob();
      // Try modern image clipboard API
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
        // fallback: copy text representation
        await navigator.clipboard.writeText(dataTitleText);
      }
    } catch (err) {
      console.error(`Failed to copy image`, err);
      // fallback to text copy
      try {
        await navigator.clipboard.writeText(dataTitleText);
        // eslint-disable-next-line no-empty
      } catch {}
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/qr.png`);
      const blob = await res.blob();
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
    // Share now just copies text to clipboard per updated spec
    // Future: popup/modal with email/x/facebook options could be added here
    try {
      await navigator.clipboard.writeText(dataTitleText);
    } catch (err) {
      console.error(`Failed to share (copy)`, err);
    }
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
    <Card
      className={cn(
        `flex flex-col relative max-w-full cursor-pointer hover:shadow-md transition-shadow`,
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
            <p className="text-sm text-muted-foreground truncate">{typeText}</p>
          </div>
        </div>
        <Image
          src="/qr.png"
          height={200}
          width={200}
          alt={`QR Code for ${cardTitleText}`}
          className="place-self-center dark:contrast-125 dark:brightness-75 mt-auto"
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
        className: `absolute cursor-pointer px-2 py-2 top-4 right-4 h-9 w-9 hover:text-primary transition-colors`,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onClick: handlePinClick,
        [`aria-label`]: isBookmark ? `Unpin QR` : `Pin QR`,
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
  );
}
