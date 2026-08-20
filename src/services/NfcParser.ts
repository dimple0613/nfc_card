import {NfcCard, NfcRecord} from '../models/NfcCard';

function bytesToHex(bytes: number[]): string {
  return bytes
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(':');
}

function parseTextRecord(payload: number[]): NfcRecord {
  let languageCodeLength = 0;
  if (payload.length > 0) {
    languageCodeLength = payload[0] & 0x3f;
  }
  const languageCode = String.fromCharCode(
    ...payload.slice(1, 1 + languageCodeLength),
  );
  const textBytes = payload.slice(1 + languageCodeLength);
  const payload_str = String.fromCharCode(...textBytes);

  return {
    type: 'Text',
    languageCode,
    payload: payload_str,
    rawPayload: bytesToHex(payload),
  };
}

function parseUriRecord(payload: number[]): NfcRecord {
  const uriPrefixes = [
    '',
    'http://www.',
    'https://www.',
    'http://',
    'https://',
    'tel:',
    'mailto:',
    'ftp://anonymous:anonymous@',
    'ftp://ftp.',
    'ftps://',
    'sftp://',
    'smb://',
    'nfs://',
    'ftp://',
    'dav://',
    'news:',
    'telnet://',
    'imap:',
    'rtsp://',
    'urn:',
    'pop:',
    'sip:',
    'sips:',
    'tftp:',
    'btspp://',
    'btl2cap://',
    'btgoep://',
    'tcpobex://',
    'irdaobex://',
    'file://',
    'urn:epc:id:',
    'urn:epc:tag:',
    'urn:epc:pat:',
    'urn:epc:raw:',
    'urn:epc:',
    'urn:nfc:',
  ];

  let payload_str = '';
  if (payload.length > 0) {
    const prefixIndex = payload[0];
    if (prefixIndex < uriPrefixes.length) {
      payload_str += uriPrefixes[prefixIndex];
    }
    const uriBytes = payload.slice(1);
    payload_str += String.fromCharCode(...uriBytes);
  }

  return {
    type: 'URI',
    payload: payload_str,
    rawPayload: bytesToHex(payload),
  };
}

function parseMimeRecord(payload: number[], mimeType: string): NfcRecord {
  return {
    type: 'MIME',
    mimeType,
    payload: String.fromCharCode(...payload),
    rawPayload: bytesToHex(payload),
  };
}

function parseNdefRecords(
  ndefMessage: Array<{type: number; payload: number[]; tnf: number}>,
): NfcRecord[] {
  const records: NfcRecord[] = [];

  for (const record of ndefMessage) {
    try {
      const {type: recordType, payload} = record;

      if (payload.length === 0) {
        records.push({
          type: 'Empty',
          payload: '',
          rawPayload: '',
        });
        continue;
      }

      switch (recordType) {
        case 0x01:
          if (payload.length > 0 && payload[0] === 0x02) {
            records.push(parseTextRecord(payload));
          } else {
            records.push({
              type: 'Unknown',
              payload: bytesToHex(payload),
              rawPayload: bytesToHex(payload),
            });
          }
          break;
        case 0x02:
          records.push(parseUriRecord(payload));
          break;
        default:
          records.push({
            type: `Type-${recordType}`,
            payload: bytesToHex(payload),
            rawPayload: bytesToHex(payload),
          });
          break;
      }
    } catch {
      records.push({
        type: 'Malformed',
        payload: bytesToHex(record.payload as number[]),
        rawPayload: bytesToHex(record.payload as number[]),
      });
    }
  }

  return records;
}

function generateCardId(uid: string | null, technologies: string[]): string {
  if (uid) {
    return uid;
  }
  const timestamp = Date.now().toString(36);
  const techHash = technologies.join(',').split('').reduce(
    (acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0,
    0,
  );
  return `unknown-${timestamp}-${Math.abs(techHash).toString(16)}`;
}

export function parseNfcTag(tag: unknown): NfcCard {
  const tagObj = tag as Record<string, unknown>;

  const uid: string | null = tagObj.id
    ? typeof tagObj.id === 'string'
      ? tagObj.id
      : Array.isArray(tagObj.id)
        ? bytesToHex(tagObj.id as number[])
        : null
    : null;

  const technologies: string[] = [];
  if (Array.isArray(tagObj.techTypes)) {
    for (const tech of tagObj.techTypes as string[]) {
      if (typeof tech === 'string') {
        const shortName = tech.split('.').pop() || tech;
        technologies.push(shortName);
      }
    }
  }

  let ndefAvailable = false;
  let records: NfcRecord[] = [];

  if (tagObj.ndefMessage && Array.isArray(tagObj.ndefMessage) && (tagObj.ndefMessage as unknown[]).length > 0) {
    ndefAvailable = true;
    records = parseNdefRecords(
      tagObj.ndefMessage as Array<{type: number; payload: number[]; tnf: number}>,
    );
  }

  const cardId = generateCardId(uid, technologies);

  return {
    id: cardId,
    uid,
    technologies,
    ndefAvailable,
    records,
    detectedAt: new Date().toISOString(),
    readStatus: 'success',
  };
}

export function parseNfcReadError(error: unknown): NfcCard {
  const errorMessage =
    error instanceof Error ? error.message : 'Unknown NFC read error';

  return {
    id: `error-${Date.now()}`,
    uid: null,
    technologies: [],
    ndefAvailable: false,
    records: [],
    detectedAt: new Date().toISOString(),
    readStatus: 'failed',
    errorMessage,
  };
}

export {bytesToHex, parseNdefRecords, generateCardId};
