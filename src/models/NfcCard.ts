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

export interface NfcCard {
  id: string;
  uid: string | null;
  technologies: string[];
  ndefAvailable: boolean;
  records: NfcRecord[];
  detectedAt: string;
  readStatus: 'success' | 'failed';
  errorMessage?: string;
}

export type NfcPlatformSupport = 'supported' | 'partially_supported' | 'platform_restricted' | 'not_supported';
