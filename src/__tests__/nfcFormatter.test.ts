import {
  formatUid,
  formatTechnologies,
  formatTimestamp,
  formatRecordPayload,
  getNfcStatusMessage,
} from '../utils/nfcFormatter';

describe('nfcFormatter', () => {
  describe('formatUid', () => {
    it('formats valid UID', () => {
      expect(formatUid('04:A1:B2:C3:D4')).toBe('04:A1:B2:C3:D4');
    });

    it('returns "Not available" for null UID', () => {
      expect(formatUid(null)).toBe('Not available');
    });
  });

  describe('formatTechnologies', () => {
    it('formats single technology', () => {
      expect(formatTechnologies(['NfcA'])).toBe('NfcA');
    });

    it('formats multiple technologies', () => {
      expect(formatTechnologies(['NfcA', 'Ndef', 'IsoDep'])).toBe(
        'NfcA, Ndef, IsoDep',
      );
    });

    it('returns "Not available" for empty array', () => {
      expect(formatTechnologies([])).toBe('Not available');
    });
  });

  describe('formatTimestamp', () => {
    it('formats ISO string to HH:MM:SS', () => {
      const timestamp = '2024-01-15T17:35:21.000Z';
      const result = formatTimestamp(timestamp);
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it('pads single digits with zeros', () => {
      const timestamp = '2024-01-15T09:05:03.000Z';
      const result = formatTimestamp(timestamp);
      expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('formatRecordPayload', () => {
    it('formats normal payload', () => {
      expect(formatRecordPayload('Hello World')).toBe('Hello World');
    });

    it('formats empty payload', () => {
      expect(formatRecordPayload('')).toBe('(empty)');
    });
  });

  describe('getNfcStatusMessage', () => {
    it('returns INITIALIZING message', () => {
      const result = getNfcStatusMessage('INITIALIZING');
      expect(result.title).toBe('INITIALIZING');
      expect(result.color).toBe('#F59E0B');
    });

    it('returns NFC_UNAVAILABLE message', () => {
      const result = getNfcStatusMessage('NFC_UNAVAILABLE');
      expect(result.title).toBe('NFC UNAVAILABLE');
      expect(result.message).toContain('does not support NFC');
      expect(result.color).toBe('#EF4444');
    });

    it('returns NFC_DISABLED message', () => {
      const result = getNfcStatusMessage('NFC_DISABLED');
      expect(result.title).toBe('NFC DISABLED');
      expect(result.message).toContain('enable NFC');
    });

    it('returns READY message', () => {
      const result = getNfcStatusMessage('READY');
      expect(result.title).toBe('NFC READY');
      expect(result.color).toBe('#10B981');
    });

    it('returns DETECTING message', () => {
      const result = getNfcStatusMessage('DETECTING');
      expect(result.title).toBe('NFC READY');
      expect(result.color).toBe('#10B981');
    });

    it('returns READING message', () => {
      const result = getNfcStatusMessage('READING');
      expect(result.title).toBe('READING');
      expect(result.color).toBe('#3B82F6');
    });

    it('returns CARD_DETECTED message', () => {
      const result = getNfcStatusMessage('CARD_DETECTED');
      expect(result.title).toBe('CARD DETECTED');
      expect(result.color).toBe('#10B981');
    });

    it('returns DUPLICATE_CARD message', () => {
      const result = getNfcStatusMessage('DUPLICATE_CARD');
      expect(result.title).toBe('DUPLICATE');
    });

    it('returns ERROR message', () => {
      const result = getNfcStatusMessage('ERROR');
      expect(result.title).toBe('ERROR');
      expect(result.color).toBe('#EF4444');
    });

    it('returns STOPPED message', () => {
      const result = getNfcStatusMessage('STOPPED');
      expect(result.title).toBe('STOPPED');
      expect(result.color).toBe('#6B7280');
    });

    it('returns UNKNOWN for unrecognized state', () => {
      const result = getNfcStatusMessage('SOME_UNKNOWN_STATE');
      expect(result.title).toBe('UNKNOWN');
    });
  });
});
