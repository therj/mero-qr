import { nanoid } from 'nanoid';
import * as R from 'ramda';
import { QRCodeTypeEnum, NetworkTypeEnum } from '@/constants/enums';
import { faker } from '@faker-js/faker';
import {
  IBaseQr,
  TBook,
  TContact,
  TEmail,
  TLink,
  TPhone,
  TSms,
  TText,
  TWifiOpenData,
  TWifi,
} from '@/types/qr';
import { qrToContent } from '@/helpers/qr/toContent';

const getQrBaseData = (): Omit<IBaseQr, `type`> => {
  const now = Date.now();
  const fav = faker.datatype.boolean({ probability: 0.15 });
  return {
    id: nanoid(),
    title: faker.lorem.words({ min: 2, max: 4 }),
    description: faker.lorem.sentence({ min: 2, max: 7 }),
    tags: [],
    favorite: fav,
    isBookmark: fav,
    createdAt: faker.date.recent({ days: 30 }).getTime(),
    updatedAt: now,
    createdByDeviceId: `seed-device`,
    updatedByDeviceId: `seed-device`,
    version: 1,
    deletedAt: null,
    metadata: { source: `created` },
    content: ``,
  };
};

const generateRandomBookQrCodeData = (): TBook => {
  const baseData = getQrBaseData();
  const BookData: TBook = {
    ...baseData,
    type: QRCodeTypeEnum.book,
    data: {
      title: faker.lorem.words({ min: 2, max: 4 }),
      author: faker.person.fullName(),
      isbn13: faker.commerce.isbn(13),
    },
  };

  if (faker.datatype.boolean(0.6)) {
    BookData.data = R.omit([`author`], BookData.data);
  }
  if (faker.datatype.boolean(0.9)) {
    BookData.data = R.omit([`isbn13`], BookData.data);
  }

  BookData.content = qrToContent(BookData);
  return BookData;
};

const generateRandomContactQrCodeData = (): TContact => {
  const baseData = getQrBaseData();
  const contactData: TContact = {
    ...baseData,
    type: QRCodeTypeEnum.contact,
    data: {
      name: faker.person.fullName(),
      phoneNumber: faker.phone.number(),
      email: faker.internet.email(),
      company: faker.company.name(),
      jobTitle: faker.person.jobTitle(),
    },
  };

  if (faker.datatype.boolean(0.3)) {
    contactData.data = R.omit([`email`], contactData.data);
  }
  if (faker.datatype.boolean(0.6)) {
    contactData.data = R.omit([`company`], contactData.data);
  }
  if (faker.datatype.boolean()) {
    contactData.data = R.omit([`jobTitle`], contactData.data);
  }

  contactData.content = qrToContent(contactData);
  return contactData;
};

const generateRandomEmailQrCodeData = (): TEmail => {
  const baseData = getQrBaseData();
  const emailData: TEmail = {
    ...baseData,
    type: QRCodeTypeEnum.email,
    data: {
      to: faker.internet.email(),
      cc: faker.internet.email(),
      subject: faker.lorem.words({ min: 2, max: 4 }),
      body: faker.lorem.sentence({ min: 2, max: 7 }),
    },
  };

  if (faker.datatype.boolean(0.8)) {
    emailData.data = R.omit([`cc`], emailData.data);
  }
  if (faker.datatype.boolean(0.4)) {
    emailData.data = R.omit([`body`], emailData.data);
  }

  emailData.content = qrToContent(emailData);
  return emailData;
};

const generateRandomLinkQrCodeData = (): TLink => {
  const baseData = getQrBaseData();
  const textData: TLink = {
    ...baseData,
    type: QRCodeTypeEnum.link,
    data: {
      url: faker.internet.url(),
    },
  };

  textData.content = qrToContent(textData);
  return textData;
};

const generateRandomPhoneQrCodeData = (): TPhone => {
  const baseData = getQrBaseData();
  const phoneData: TPhone = {
    ...baseData,
    type: QRCodeTypeEnum.phone,
    data: {
      phoneNumber: faker.phone.number(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
    },
  };

  if (faker.datatype.boolean(0.8)) {
    phoneData.data = R.omit([`name`], phoneData.data);
  }
  if (faker.datatype.boolean()) {
    phoneData.data = R.omit([`email`], phoneData.data);
  }

  phoneData.content = qrToContent(phoneData);
  return phoneData;
};

const generateRandomSmsQrCodeData = (): TSms => {
  const baseData = getQrBaseData();
  const smsData: TSms = {
    ...baseData,
    type: QRCodeTypeEnum.sms,
    data: {
      to: faker.phone.number(),
      text: faker.lorem.sentence({ min: 2, max: 7 }),
    },
  };

  if (faker.datatype.boolean(0.2)) {
    smsData.data = R.omit([`text`], smsData.data);
  }

  smsData.content = qrToContent(smsData);
  return smsData;
};

const generateRandomTextQrCodeData = (): TText => {
  const baseData = getQrBaseData();
  const textData: TText = {
    ...baseData,
    type: QRCodeTypeEnum.text,
    data: {
      text: faker.lorem.sentence({ min: 2, max: 7 }),
    },
  };

  textData.content = qrToContent(textData);
  return textData;
};

const generateRandomWifiQrCodeData = (type?: NetworkTypeEnum): TWifi => {
  const baseData = getQrBaseData();

  const availableTypes = Object.values(NetworkTypeEnum);
  const chosenNetworkType = type || faker.helpers.arrayElement(availableTypes);

  const wifiData: TWifi = {
    ...baseData,
    type: QRCodeTypeEnum.wifi,
    data: {
      name: faker.company.name(),
      networkType: chosenNetworkType,
      password: faker.internet.password(),
    },
  };

  if (chosenNetworkType === NetworkTypeEnum.open) {
    wifiData.data = R.omit([`password`], wifiData.data) as TWifiOpenData;
  }

  wifiData.content = qrToContent(wifiData);
  return wifiData;
};

const qrMap = {
  [QRCodeTypeEnum.book]: generateRandomBookQrCodeData,
  [QRCodeTypeEnum.contact]: generateRandomContactQrCodeData,
  [QRCodeTypeEnum.email]: generateRandomEmailQrCodeData,
  [QRCodeTypeEnum.link]: generateRandomLinkQrCodeData,
  [QRCodeTypeEnum.phone]: generateRandomPhoneQrCodeData,
  [QRCodeTypeEnum.sms]: generateRandomSmsQrCodeData,
  [QRCodeTypeEnum.text]: generateRandomTextQrCodeData,
  [QRCodeTypeEnum.wifi]: generateRandomWifiQrCodeData,
};

export default qrMap;
