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
import { Fragment, useState } from 'react';
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
import { Button } from './ui/button';
import { QrForm } from './qr-form';

export interface AddQrModalProps extends DialogProps {
  isOpen: boolean;
  onToggleDialog: (dialogState: boolean) => void;
}
const AddQrModal = ({ onToggleDialog, isOpen }: AddQrModalProps) => {
  const [QRToAdd, setQRToAdd] = useState<QRCodeTypeEnum | null>(null);

  const toggleDialog = (setOpen: boolean) => {
    if (!setOpen) {
      setQRToAdd(null);
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
            <DialogTitle>Add new QR</DialogTitle>
            <DialogDescription>
              Fill the form to create a QR. Latest items first, pinned items on
              top
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-1.5 items-center justify-center">
            <div className="rounded-lg py-2">
              <Select
                value={QRToAdd ?? undefined}
                onValueChange={(v: QRCodeTypeEnum) => {
                  setQRToAdd(v);
                }}
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
          <QrForm type={QRToAdd} onSuccess={closeDialog} />
          <DialogFooter className="sm:justify-end dialog-footer">
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
