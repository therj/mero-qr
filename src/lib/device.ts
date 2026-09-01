'use client';

import { nanoid } from 'nanoid';

const DEVICE_ID_KEY = `meroqr:deviceId`;
const DEVICE_NAME_KEY = `meroqr:deviceName`;

export function getDeviceId(): string {
  if (typeof window === `undefined`) return `ssr-device`;
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = nanoid();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getDeviceName(): string {
  if (typeof window === `undefined`) return `Server`;
  let name = localStorage.getItem(DEVICE_NAME_KEY);
  if (!name) {
    name = `Device-${getDeviceId().slice(0, 6)}`;
    localStorage.setItem(DEVICE_NAME_KEY, name);
  }
  return name;
}

export function setDeviceName(name: string) {
  if (typeof window !== `undefined`) {
    localStorage.setItem(DEVICE_NAME_KEY, name);
  }
}
