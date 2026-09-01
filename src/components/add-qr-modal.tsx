'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from '@ui/dialog';
import { Fragment, useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QRCodeTypeEnum, QRGroup } from '@/constants/enums';
import { DialogProps } from '@radix-ui/react-dialog';
import { TQr } from '@/types/qr';
import { Button } from './ui/button';
import { QrForm } from './qr-form';

export interface AddQrModalProps extends DialogProps {
  isOpen: boolean;
  onToggleDialog: (dialogState: boolean) => void;
  initialData?: TQr | null;
  readOnly?: boolean;
}

const AddQrModal = ({
  onToggleDialog,
  isOpen,
  initialData,
  readOnly = false,
}: AddQrModalProps) => {
  const [QRToAdd, setQRToAdd] = useState<QRCodeTypeEnum | null>(
    initialData?.type ?? null
  );
  const [isEditing, setIsEditing] = useState(false);

  // derived read-only view: when readOnly prop true and not yet editing
  const isReadOnlyView = readOnly && !isEditing;
  const isEdit = Boolean(initialData);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setQRToAdd(initialData.type);
      }
      // reset editing when opening/closing or initialData changes
      setIsEditing(false);
    } else if (!initialData) {
      setQRToAdd(null);
      setIsEditing(false);
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    // also reset when readOnly prop changes externally
    if (!isOpen) setIsEditing(false);
  }, [readOnly, isOpen]);

  const toggleDialog = (setOpen: boolean) => {
    if (!setOpen) {
      if (!initialData) {
        setQRToAdd(null);
      }
      setIsEditing(false);
    }
    onToggleDialog(setOpen);
  };

  const closeDialog = () => {
    toggleDialog(false);
  };

  return (
    <Dialog modal open={isOpen} onOpenChange={toggleDialog}>
      <DialogOverlay className="border-4">
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {/* eslint-disable-next-line no-nested-ternary */}
              {isReadOnlyView ? `View QR` : isEdit ? `Edit QR` : `Add new QR`}
            </DialogTitle>
            <DialogDescription>
              {/* eslint-disable-next-line no-nested-ternary */}
              {isReadOnlyView
                ? `Read-only view. Unlock to edit.`
                : isEdit
                  ? `Update the QR data and save`
                  : `Fill the form to create a QR. Latest items first, pinned items on top`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-1.5 items-center justify-center">
            <div className="rounded-lg py-2">
              <Select
                value={QRToAdd ?? undefined}
                onValueChange={(v: QRCodeTypeEnum) => {
                  setQRToAdd(v);
                }}
                disabled={isEdit}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="QR Type" />
                </SelectTrigger>
                <SelectContent>
                  {QRGroup.map((group, i) => (
                    <Fragment key={group.name}>
                      <SelectGroup key={group.name}>
                        {group.items.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      {i < QRGroup.length - 1 && <SelectSeparator />}
                    </Fragment>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <QrForm
            type={QRToAdd}
            initialData={initialData ?? null}
            onSuccess={closeDialog}
            readOnly={isReadOnlyView}
          />
          <DialogFooter className="sm:justify-end dialog-footer gap-2">
            {isReadOnlyView && isEdit && (
              <Button type="button" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
            <DialogClose asChild onClick={closeDialog}>
              <Button type="button" variant="ghost">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </DialogOverlay>
    </Dialog>
  );
};

export default AddQrModal;
