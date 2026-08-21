import {
  bytesToAscii,
  getManufacturerFromUid,
  computeUsedBytes,
} from '../services/TagReader';

describe('TagReader', () => {
  describe('bytesToAscii', () => {
    it('converts printable bytes to characters', () => {
      const bytes = 'Hello'.split('').map(c => c.charCodeAt(0));
      expect(bytesToAscii(bytes)).toBe('Hello');
    });

    it('replaces non-printable bytes with dots', () => {
      expect(bytesToAscii([0x00, 0x41, 0x1f, 0x42, 0xff])).toBe('.A.B.');
    });

    it('returns empty string for empty input', () => {
      expect(bytesToAscii([])).toBe('');
    });
  });

  describe('getManufacturerFromUid', () => {
    it('identifies NXP from leading byte 0x04', () => {
      expect(getManufacturerFromUid([0x04, 0x12, 0x34])).toBe(
        'NXP Semiconductors',
      );
    });

    it('returns undefined for unknown manufacturer byte', () => {
      expect(getManufacturerFromUid([0xaa, 0xbb])).toBeUndefined();
    });

    it('returns undefined for empty uid', () => {
      expect(getManufacturerFromUid([])).toBeUndefined();
    });
  });

  describe('computeUsedBytes', () => {
    it('computes size for a single text record', () => {
      const records = [
        {type: [0x54], payload: [0x02, 0x65, 0x6e, 0x48, 0x69]},
      ];
      expect(computeUsedBytes(records)).toBe(2 + 3 + 1 + 5);
    });

    it('includes id length when present', () => {
      const records = [
        {type: [0x54], payload: [0x01], id: [0x01, 0x02]},
      ];
      expect(computeUsedBytes(records)).toBe(2 + 3 + 1 + 1 + 2);
    });

    it('returns header size only for empty message', () => {
      expect(computeUsedBytes([])).toBe(2);
    });
  });
});
