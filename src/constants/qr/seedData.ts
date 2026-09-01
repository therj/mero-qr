import { nanoid } from 'nanoid';

import { TQr } from '@/types/qr';
import { QRCodeTypeEnum, NetworkTypeEnum } from '@/constants/enums';
import { faker } from '@faker-js/faker';
import { qrToContent } from '@/helpers/qr/toContent';

const getRecentNumber = (days: number = 30): number => {
  return faker.date.recent({ days }).getTime();
};

const now = Date.now();

const baseFields = (isFav: boolean) => ({
  tags: [] as string[],
  favorite: isFav,
  isBookmark: isFav,
  createdAt: getRecentNumber(),
  updatedAt: now,
  createdByDeviceId: `seed-device`,
  updatedByDeviceId: `seed-device`,
  version: 1,
  deletedAt: null as number | null,
  metadata: { source: `created` as const },
});

const qrCodeData: TQr[] = [
  {
    id: nanoid(),
    type: QRCodeTypeEnum.wifi,
    title: `Mero Internet`,
    description: `Second floor only`,
    ...baseFields(true),
    data: {
      networkType: NetworkTypeEnum.wpa_wpa2,
      name: `ALHN-69B5`,
      password: `12345678`,
    },
    content: ``,
  },
  {
    id: nanoid(),
    type: QRCodeTypeEnum.link,
    title: `Personal Website`,
    description: `Visit my personal website`,
    ...baseFields(true),
    data: {
      url: `https://www.example.com`,
    },
    content: ``,
  },
  {
    id: nanoid(),
    type: QRCodeTypeEnum.text,
    title: `Important Note`,
    description: `Important note to self`,
    ...baseFields(false),
    data: {
      text: `Remember to buy groceries. Remember to buy groceries. Again! Remember to buy groceries. Remember to buy groceries. Again!`,
    },
    content: ``,
  },
  {
    id: nanoid(),
    type: QRCodeTypeEnum.book,
    title: `The Abominable - Dan Simmons`,
    description: `A thrilling tale of high-altitude death and survival set on the snowy summits of Mount Everest, from the bestselling author of The Terror.`,
    ...baseFields(false),
    data: {
      title: `The Abominable`,
      author: `Dan Simmons`,
      isbn13: `9780316198837`,
    },
    content: ``,
  },
  {
    id: nanoid(),
    type: QRCodeTypeEnum.contact,
    title: `Contact Information`,
    description: `Reach out to me anytime`,
    ...baseFields(false),
    data: {
      name: `John Doe`,
      phoneNumber: `123-456-7890`,
      email: `john.doe@example.com`,
    },
    content: ``,
  },
  {
    id: nanoid(),
    type: QRCodeTypeEnum.contact,
    title: `Business Card`,
    description: `Connect with me professionally`,
    ...baseFields(false),
    data: {
      name: `Jane Smith`,
      jobTitle: `CEO`,
      company: `XYZ Corp`,
      email: `jane.smith@xyzcorp.com`,
      phoneNumber: `987-654-3210`,
    },
    content: ``,
  },
  {
    id: nanoid(),
    type: QRCodeTypeEnum.sms,
    title: `Meeting with the God`,
    description: `Access code to the heaven`,
    ...baseFields(false),
    data: {
      to: `9876543210`,
      text: `What time is the world ending?`,
    },
    content: ``,
  },
  {
    id: nanoid(),
    type: QRCodeTypeEnum.link,
    title: `Social Media Profile`,
    description: `Connect with me on social media`,
    ...baseFields(false),
    data: {
      url: `https://www.twitter.com/example`,
    },
    content: ``,
  },
  {
    id: nanoid(),
    type: QRCodeTypeEnum.phone,
    title: `Emergency Contact`,
    description: `In case of emergencies`,
    ...baseFields(false),
    data: {
      name: `John Doe`,
      phoneNumber: `123-456-7890`,
      email: `johndoe@example.com`,
    },
    content: ``,
  },
  {
    id: nanoid(),
    type: QRCodeTypeEnum.email,
    title: `Send Mail to PO`,
    description: `Get Approval for deployment`,
    ...baseFields(false),
    data: {
      to: `johndoe@example.com`,
      cc: `johndoe2@example.com`,
      subject: `Verified on development environment`,
      body: `Deployment Approval, please`,
    },
    content: ``,
  },
  {
    id: nanoid(),
    type: QRCodeTypeEnum.text,
    title: `Text Message`,
    description: `Important text`,
    ...baseFields(false),
    data: {
      text: `Read this important message!`,
    },
    content: ``,
  },
];

// derive content for each
qrCodeData.forEach((qr) => {
  // eslint-disable-next-line no-param-reassign
  qr.content = qrToContent(qr);
});

export default qrCodeData;
