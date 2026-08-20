import {NfcDuplicateDetector} from '../services/NfcDuplicateDetector';

describe('NfcDuplicateDetector', () => {
  let detector: NfcDuplicateDetector;

  beforeEach(() => {
    detector = new NfcDuplicateDetector();
  });

  describe('add', () => {
    it('adds a new card successfully', () => {
      const result = detector.add('CARD_A');
      expect(result).toBe(true);
      expect(detector.size()).toBe(1);
    });

    it('does not add duplicate NFC cards', () => {
      detector.add('CARD_A');
      const result = detector.add('CARD_A');
      expect(result).toBe(false);
      expect(detector.size()).toBe(1);
    });

    it('adds different cards', () => {
      detector.add('CARD_A');
      detector.add('CARD_B');
      expect(detector.size()).toBe(2);
    });

    it('adds three different cards', () => {
      detector.add('CARD_A');
      detector.add('CARD_B');
      detector.add('CARD_C');
      expect(detector.size()).toBe(3);
    });
  });

  describe('hasCardBeenDetected', () => {
    it('returns false for unknown card', () => {
      expect(detector.hasCardBeenDetected('CARD_A')).toBe(false);
    });

    it('returns true for detected card', () => {
      detector.add('CARD_A');
      expect(detector.hasCardBeenDetected('CARD_A')).toBe(true);
    });

    it('returns false for different card', () => {
      detector.add('CARD_A');
      expect(detector.hasCardBeenDetected('CARD_B')).toBe(false);
    });
  });

  describe('multiple cards scenario', () => {
    it('handles A, B, C sequence', () => {
      detector.add('CARD_A');
      detector.add('CARD_B');
      detector.add('CARD_C');
      expect(detector.size()).toBe(3);
    });

    it('handles A, B, A sequence (no duplicate)', () => {
      detector.add('CARD_A');
      detector.add('CARD_B');
      const result = detector.add('CARD_A');
      expect(result).toBe(false);
      expect(detector.size()).toBe(2);
    });

    it('handles A, B, C, A sequence', () => {
      detector.add('CARD_A');
      detector.add('CARD_B');
      detector.add('CARD_C');
      const result = detector.add('CARD_A');
      expect(result).toBe(false);
      expect(detector.size()).toBe(3);
    });

    it('handles A, A, A, A (only one entry)', () => {
      detector.add('CARD_A');
      detector.add('CARD_A');
      detector.add('CARD_A');
      detector.add('CARD_A');
      expect(detector.size()).toBe(1);
    });
  });

  describe('clear', () => {
    it('removes all detected cards', () => {
      detector.add('CARD_A');
      detector.add('CARD_B');
      detector.clear();
      expect(detector.size()).toBe(0);
    });

    it('allows re-adding cards after clear', () => {
      detector.add('CARD_A');
      detector.clear();
      const result = detector.add('CARD_A');
      expect(result).toBe(true);
      expect(detector.size()).toBe(1);
    });
  });

  describe('getAll', () => {
    it('returns empty array initially', () => {
      expect(detector.getAll()).toEqual([]);
    });

    it('returns all detected card IDs', () => {
      detector.add('CARD_A');
      detector.add('CARD_B');
      expect(detector.getAll()).toEqual(['CARD_A', 'CARD_B']);
    });

    it('does not include duplicates', () => {
      detector.add('CARD_A');
      detector.add('CARD_A');
      expect(detector.getAll()).toEqual(['CARD_A']);
    });
  });

  describe('UID-based detection', () => {
    it('handles real NFC UIDs', () => {
      const uid1 = '04:A1:B2:C3:D4';
      const uid2 = '04:E5:F6:G7:H8';
      detector.add(uid1);
      detector.add(uid2);
      expect(detector.size()).toBe(2);
      expect(detector.hasCardBeenDetected(uid1)).toBe(true);
      expect(detector.hasCardBeenDetected(uid2)).toBe(true);
    });
  });

  describe('unknown card IDs', () => {
    it('handles cards without UIDs', () => {
      const unknownId = 'unknown-abc123-42f';
      detector.add(unknownId);
      expect(detector.size()).toBe(1);
      expect(detector.hasCardBeenDetected(unknownId)).toBe(true);
    });
  });
});
