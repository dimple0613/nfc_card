import {
  parseNfcTag,
  parseNfcReadError,
  bytesToHex,
  parseNdefRecords,
  generateCardId,
} from '../services/NfcParser';

describe('NfcParser', () => {
  describe('bytesToHex', () => {
    it('converts byte array to hex string', () => {
      expect(bytesToHex([0x04, 0xa1, 0xb2])).toBe('04:A1:B2');
    });

    it('pads single digits with zeros', () => {
      expect(bytesToHex([0x00, 0x01, 0x0f])).toBe('00:01:0F');
    });

    it('returns empty string for empty array', () => {
      expect(bytesToHex([])).toBe('');
    });
  });

  describe('generateCardId', () => {
    it('generates ID from UID when available', () => {
      const id = generateCardId('04:A1:B2:C3:D4', ['NfcA']);
      expect(id).toBe('04:A1:B2:C3:D4');
    });

    it('generates fallback ID when UID is null', () => {
      const id = generateCardId(null, ['NfcA']);
      expect(id).toMatch(/^unknown-/);
    });

    it('generates different IDs for different technologies without UID', () => {
      const id1 = generateCardId(null, ['NfcA']);
      const id2 = generateCardId(null, ['NfcB']);
      expect(id1).not.toBe(id2);
    });
  });

  describe('parseNfcTag', () => {
    it('parses NFC-A tag with UID', () => {
      const tag = {
        id: [0x04, 0xa1, 0xb2, 0xc3, 0xd4],
        techTypes: ['android.nfc.tech.NfcA'],
      };

      const card = parseNfcTag(tag);
      expect(card.uid).toBe('04:A1:B2:C3:D4');
      expect(card.technologies).toContain('NfcA');
      expect(card.readStatus).toBe('success');
    });

    it('parses tag with string UID', () => {
      const tag = {
        id: 'ABCDEF123456',
        techTypes: ['android.nfc.tech.NfcA'],
      };

      const card = parseNfcTag(tag);
      expect(card.uid).toBe('ABCDEF123456');
    });

    it('parses NDEF text record', () => {
      const tag = {
        id: [0x04, 0xa1],
        techTypes: ['android.nfc.tech.Ndef'],
        ndefMessage: [
          {
            type: 0x01,
            tnf: 0x01,
            payload: [0x02, 0x65, 0x6e, 0x48, 0x65, 0x6c, 0x6c, 0x6f],
          },
        ],
      };

      const card = parseNfcTag(tag);
      expect(card.ndefAvailable).toBe(true);
      expect(card.records).toHaveLength(1);
      expect(card.records[0].type).toBe('Text');
      expect(card.records[0].languageCode).toBe('en');
      expect(card.records[0].payload).toBe('Hello');
    });

    it('parses NDEF URI record', () => {
      const tag = {
        id: [0x04, 0xa1],
        techTypes: ['android.nfc.tech.Ndef'],
        ndefMessage: [
          {
            type: 0x02,
            tnf: 0x01,
            payload: [
              0x02,
              0x65,
              0x78,
              0x61,
              0x6d,
              0x70,
              0x6c,
              0x65,
              0x2e,
              0x63,
              0x6f,
              0x6d,
            ],
          },
        ],
      };

      const card = parseNfcTag(tag);
      expect(card.ndefAvailable).toBe(true);
      expect(card.records[0].type).toBe('URI');
      expect(card.records[0].payload).toContain('example.com');
    });

    it('handles tag with no NDEF', () => {
      const tag = {
        id: [0x04, 0xa1],
        techTypes: ['android.nfc.tech.NfcA'],
      };

      const card = parseNfcTag(tag);
      expect(card.ndefAvailable).toBe(false);
      expect(card.records).toHaveLength(0);
    });

    it('handles missing UID gracefully', () => {
      const tag = {
        techTypes: ['android.nfc.tech.NfcA'],
      };

      const card = parseNfcTag(tag);
      expect(card.uid).toBeNull();
      expect(card.id).toMatch(/^unknown-/);
    });

    it('handles unknown technology', () => {
      const tag = {
        id: [0x04],
        techTypes: ['android.nfc.tech.UnknownTech'],
      };

      const card = parseNfcTag(tag);
      expect(card.technologies).toContain('UnknownTech');
    });

    it('handles empty NDEF message', () => {
      const tag = {
        id: [0x04],
        techTypes: ['android.nfc.tech.Ndef'],
        ndefMessage: [],
      };

      const card = parseNfcTag(tag);
      expect(card.ndefAvailable).toBe(false);
      expect(card.records).toHaveLength(0);
    });

    it('handles tag with no techTypes', () => {
      const tag = {
        id: [0x04],
      };

      const card = parseNfcTag(tag);
      expect(card.technologies).toEqual([]);
    });

    it('always sets readStatus to success', () => {
      const tag = {
        id: [0x04],
        techTypes: ['android.nfc.tech.NfcA'],
      };

      const card = parseNfcTag(tag);
      expect(card.readStatus).toBe('success');
      expect(card.detectedAt).toBeTruthy();
    });
  });

  describe('parseNfcReadError', () => {
    it('parses Error object', () => {
      const error = new Error('Tag read failed');
      const card = parseNfcReadError(error);
      expect(card.readStatus).toBe('failed');
      expect(card.errorMessage).toBe('Tag read failed');
      expect(card.uid).toBeNull();
      expect(card.technologies).toEqual([]);
    });

    it('parses string error', () => {
      const card = parseNfcReadError('Something went wrong');
      expect(card.readStatus).toBe('failed');
      expect(card.errorMessage).toBe('Unknown NFC read error');
    });

    it('parses null error', () => {
      const card = parseNfcReadError(null);
      expect(card.readStatus).toBe('failed');
    });

    it('generates error card ID', () => {
      const card = parseNfcReadError(new Error('test'));
      expect(card.id).toMatch(/^error-/);
    });
  });

  describe('parseNdefRecords', () => {
    it('parses empty NDEF message', () => {
      const records = parseNdefRecords([]);
      expect(records).toEqual([]);
    });

    it('parses text record (type 0x01)', () => {
      const records = parseNdefRecords([
        {
          type: 0x01,
          tnf: 0x01,
          payload: [0x02, 0x65, 0x6e, 0x48, 0x69],
        },
      ]);
      expect(records[0].type).toBe('Text');
      expect(records[0].payload).toBe('Hi');
    });

    it('parses URI record (type 0x02)', () => {
      const records = parseNdefRecords([
        {
          type: 0x02,
          tnf: 0x01,
          payload: [0x00, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65],
        },
      ]);
      expect(records[0].type).toBe('URI');
    });

    it('parses unknown record type', () => {
      const records = parseNdefRecords([
        {
          type: 0x10,
          tnf: 0x02,
          payload: [0x01, 0x02],
        },
      ]);
      expect(records[0].type).toBe('Type-16');
    });

    it('handles empty payload', () => {
      const records = parseNdefRecords([
        {
          type: 0x01,
          tnf: 0x01,
          payload: [],
        },
      ]);
      expect(records[0].type).toBe('Empty');
    });
  });
});
