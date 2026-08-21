import NfcManager, {NfcTech, NdefStatus} from 'react-native-nfc-manager';
import {NfcMemoryInfo, NfcRawDump, NfcRawUnit, NfcTagInfo} from '../models/NfcCard';

const ULTRALIGHT_MAX_PAGE_OFFSET = 252;
const CLASSIC_BLOCK_SIZE = 16;

interface ClassicHandler {
  mifareClassicGetSectorCount(): Promise<number>;
  mifareClassicAuthenticateA(sector: number, keys: number[]): Promise<void>;
  mifareClassicAuthenticateB(sector: number, keys: number[]): Promise<void>;
  mifareClassicSectorToBlock(sector: number): Promise<number>;
  mifareClassicGetBlockCountInSector(sector: number): Promise<number>;
  mifareClassicReadBlock(block: number): Promise<number[]>;
}

const MANUFACTURERS: Record<string, string> = {
  '04': 'NXP Semiconductors',
  '01': 'Motorola',
  '02': 'STMicroelectronics',
  '07': 'Infineon',
  '08': 'Matsushita (Panasonic)',
  '0F': 'Texas Instruments',
  '15': 'Legic',
};

export interface TagFullDetails {
  memory?: NfcMemoryInfo;
  tagInfo?: NfcTagInfo;
  rawDump?: NfcRawDump;
}

function bytesToHexCompact(bytes: number[]): string {
  return bytes.map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
}

export function bytesToAscii(bytes: number[]): string {
  return bytes
    .map(b => (b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : '.'))
    .join('');
}

export function getManufacturerFromUid(uidBytes: number[]): string | undefined {
  if (uidBytes.length === 0) {
    return undefined;
  }
  const key = uidBytes[0].toString(16).padStart(2, '0').toUpperCase();
  return MANUFACTURERS[key];
}

export function computeUsedBytes(
  records: Array<{type: number[] | string; payload: number[]; id?: number[]}>,
): number {
  let total = 2;
  for (const record of records) {
    total += 3 + record.type.length + record.payload.length + (record.id?.length ?? 0);
  }
  return total;
}

function extractTagInfo(tagObj: Record<string, unknown>): NfcTagInfo | undefined {
  const info: NfcTagInfo = {};

  if (Array.isArray(tagObj.id)) {
    const manufacturer = getManufacturerFromUid(tagObj.id as number[]);
    if (manufacturer) {
      info.manufacturer = manufacturer;
    }
  }

  const hexFields: Array<[string, 'atqa' | 'sak' | 'dsfId' | 'historicalBytes']> = [
    ['atqa', 'atqa'],
    ['sak', 'sak'],
    ['dsfId', 'dsfId'],
    ['historicalBytes', 'historicalBytes'],
  ];

  for (const [sourceKey, targetKey] of hexFields) {
    const value = tagObj[sourceKey];
    if (typeof value === 'number') {
      info[targetKey] = value.toString(16).padStart(2, '0').toUpperCase();
    } else if (Array.isArray(value)) {
      info[targetKey] = bytesToHexCompact(value as number[]);
    }
  }

  if (typeof tagObj.maxTransceiveLength === 'number') {
    info.maxTransceiveLength = tagObj.maxTransceiveLength as number;
  }

  return Object.keys(info).length > 0 ? info : undefined;
}

async function readMemoryInfo(): Promise<NfcMemoryInfo | undefined> {
  try {
    const status = await NfcManager.ndefHandler.getNdefStatus();
    if (typeof status?.capacity !== 'number') {
      return undefined;
    }

    let usedBytes = 0;
    try {
      const message = await NfcManager.ndefHandler.getNdefMessage();
      if (message?.ndefMessage) {
        usedBytes = computeUsedBytes(message.ndefMessage);
      }
    } catch {
      usedBytes = 0;
    }

    return {
      maxSize: status.capacity,
      usedBytes,
      writable: status.status === NdefStatus.ReadWrite,
      canFormat: false,
    };
  } catch {
    return undefined;
  }
}

async function dumpMifareUltralight(): Promise<NfcRawDump | undefined> {
  const units: NfcRawUnit[] = [];
  let truncated = false;

  try {
    await NfcManager.requestTechnology(NfcTech.MifareUltralight);
  } catch {
    return undefined;
  }

  try {
    for (let offset = 0; offset < ULTRALIGHT_MAX_PAGE_OFFSET; offset += 4) {
      try {
        const data = (await NfcManager.mifareUltralightHandlerAndroid.mifareUltralightReadPages(
          offset,
        )) as number[];

        for (let p = 0; p < 4; p++) {
          const page = data.slice(p * 4, p * 4 + 4);
          if (page.length === 4) {
            units.push({
              index: offset + p,
              hex: bytesToHexCompact(page),
              ascii: bytesToAscii(page),
            });
          }
        }
      } catch {
        truncated = true;
        break;
      }
    }
  } finally {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch {
      // ignore cancel errors
    }
  }

  if (units.length === 0) {
    return undefined;
  }

  return {
    technology: 'MIFARE Ultralight',
    unitLabel: 'page',
    units,
    truncated,
  };
}

async function dumpMifareClassic(): Promise<NfcRawDump | undefined> {
  const units: NfcRawUnit[] = [];
  let truncated = false;

  try {
    await NfcManager.requestTechnology(NfcTech.MifareClassic);
  } catch {
    return undefined;
  }

  const handler = NfcManager.mifareClassicHandlerAndroid as unknown as ClassicHandler;
  const wellKnownKey = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff];

  try {
    let sectorCount = 0;
    try {
      sectorCount = await handler.mifareClassicGetSectorCount();
    } catch {
      sectorCount = 16;
    }

    for (let sector = 0; sector < sectorCount; sector++) {
      try {
        await handler.mifareClassicAuthenticateA(sector, wellKnownKey);
      } catch {
        try {
          await handler.mifareClassicAuthenticateB(sector, wellKnownKey);
        } catch {
          truncated = true;
          break;
        }
      }

      try {
        const startBlock = await handler.mifareClassicSectorToBlock(sector);
        const blockCount = await handler.mifareClassicGetBlockCountInSector(sector);

        for (let b = 0; b < blockCount; b++) {
          const data = (await handler.mifareClassicReadBlock(startBlock + b)) as number[];
          if (data.length > 0) {
            units.push({
              index: units.length,
              hex: bytesToHexCompact(data),
              ascii: bytesToAscii(data),
            });
          }
        }
      } catch {
        truncated = true;
        break;
      }
    }
  } finally {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch {
      // ignore cancel errors
    }
  }

  if (units.length === 0) {
    return undefined;
  }

  return {
    technology: 'MIFARE Classic',
    unitLabel: 'block',
    units,
    truncated,
  };
}

export async function readFullTagDetails(
  tagObj: Record<string, unknown>,
): Promise<TagFullDetails> {
  const details: TagFullDetails = {};

  details.memory = await readMemoryInfo();
  details.tagInfo = extractTagInfo(tagObj);

  const techs: string[] = Array.isArray(tagObj.techTypes)
    ? (tagObj.techTypes as string[])
    : [];

  if (techs.some(t => t.includes('MifareUltralight'))) {
    details.rawDump = await dumpMifareUltralight();
  }

  if (!details.rawDump && techs.some(t => t.includes('MifareClassic'))) {
    details.rawDump = await dumpMifareClassic();
  }

  return details;
}
