export type NfcScannerState =
  | 'INITIALIZING'
  | 'NFC_UNAVAILABLE'
  | 'NFC_DISABLED'
  | 'READY'
  | 'DETECTING'
  | 'READING'
  | 'CARD_DETECTED'
  | 'DUPLICATE_CARD'
  | 'ERROR'
  | 'STOPPED';

export interface NfcRecord {
  type: string;
  mimeType?: string;
  languageCode?: string;
  payload: string;
  rawPayload?: string;
}

export interface NfcMemoryInfo {
  maxSize: number;
  usedBytes: number;
  writable: boolean;
  canFormat: boolean;
}

export interface NfcTagInfo {
  manufacturer?: string;
  atqa?: string;
  sak?: string;
  dsfId?: string;
  historicalBytes?: string;
  maxTransceiveLength?: number;
}

export interface NfcRawUnit {
  index: number;
  hex: string;
  ascii: string;
}

export interface NfcRawDump {
  technology: string;
  unitLabel: 'page' | 'block';
  units: NfcRawUnit[];
  truncated?: boolean;
}

export interface NfcCard {
  id: string;
  uid: string | null;
  technologies: string[];
  ndefAvailable: boolean;
  records: NfcRecord[];
  detectedAt: string;
  readStatus: 'success' | 'failed';
  errorMessage?: string;
  memory?: NfcMemoryInfo;
  tagInfo?: NfcTagInfo;
  rawDump?: NfcRawDump;
}

export type NfcPlatformSupport = 'supported' | 'partially_supported' | 'platform_restricted' | 'not_supported';
