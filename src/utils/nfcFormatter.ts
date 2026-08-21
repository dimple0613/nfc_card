export function formatUid(uid: string | null): string {
  if (!uid) {
    return 'Not available';
  }
  return uid;
}

export function formatTechnologies(technologies: string[]): string {
  if (technologies.length === 0) {
    return 'Not available';
  }
  return technologies.join(', ');
}

export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function formatRecordPayload(payload: string): string {
  if (!payload) {
    return '(empty)';
  }
  return payload;
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes} bytes`;
}

export {bytesToAscii} from '../services/TagReader';

export function getNfcStatusMessage(
  state: string,
): {title: string; message: string; color: string} {
  switch (state) {
    case 'INITIALIZING':
      return {
        title: 'INITIALIZING',
        message: 'Starting NFC service...',
        color: '#F59E0B',
      };
    case 'NFC_UNAVAILABLE':
      return {
        title: 'NFC UNAVAILABLE',
        message: 'This device does not support NFC.',
        color: '#EF4444',
      };
    case 'NFC_DISABLED':
      return {
        title: 'NFC DISABLED',
        message: 'NFC is disabled. Please enable NFC in your phone settings.',
        color: '#F59E0B',
      };
    case 'READY':
    case 'DETECTING':
      return {
        title: 'NFC READY',
        message: 'Bring your phone near an NFC card',
        color: '#10B981',
      };
    case 'READING':
      return {
        title: 'READING',
        message: 'Reading NFC card...',
        color: '#3B82F6',
      };
    case 'CARD_DETECTED':
      return {
        title: 'CARD DETECTED',
        message: 'NFC card detected successfully.',
        color: '#10B981',
      };
    case 'DUPLICATE_CARD':
      return {
        title: 'DUPLICATE',
        message: 'This card has already been detected.',
        color: '#F59E0B',
      };
    case 'ERROR':
      return {
        title: 'ERROR',
        message:
          'Unable to read this NFC card. Move your phone closer and try again.',
        color: '#EF4444',
      };
    case 'STOPPED':
      return {
        title: 'STOPPED',
        message: 'NFC scanner has been stopped.',
        color: '#6B7280',
      };
    default:
      return {
        title: 'UNKNOWN',
        message: 'Unknown state.',
        color: '#6B7280',
      };
  }
}
