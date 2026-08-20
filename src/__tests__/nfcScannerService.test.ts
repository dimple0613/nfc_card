import {NfcScannerService} from '../services/NfcScannerService';
import NfcManager from 'react-native-nfc-manager';

const mockNfcManager = NfcManager as jest.Mocked<typeof NfcManager>;

beforeEach(() => {
  jest.clearAllMocks();
  mockNfcManager.start.mockResolvedValue(undefined);
  mockNfcManager.isEnabled.mockResolvedValue(true);
  mockNfcManager.registerTagEvent.mockResolvedValue(undefined);
  mockNfcManager.unregisterTagEvent.mockResolvedValue(undefined);
  mockNfcManager.cancelTechnologyRequest.mockResolvedValue(undefined);
  mockNfcManager.setEventListener.mockImplementation(() => {});
  mockNfcManager.setAlertMessageIOS.mockResolvedValue(undefined);
  (mockNfcManager.ndefHandler.getNdefMessage as jest.Mock).mockResolvedValue(null);
});

describe('NfcScannerService', () => {
  let service: NfcScannerService;

  beforeEach(() => {
    jest.useFakeTimers();
    service = new NfcScannerService();
  });

  afterEach(() => {
    jest.useRealTimers();
    service.destroy();
  });

  describe('initialization', () => {
    it('starts in INITIALIZING state', () => {
      expect(service.getState()).toBe('INITIALIZING');
    });

    it('transitions to READY when NFC is available', async () => {
      await service.initialize();
      expect(service.getState()).toBe('READY');
      expect(mockNfcManager.start).toHaveBeenCalled();
      expect(mockNfcManager.isEnabled).toHaveBeenCalled();
    });

    it('transitions to NFC_UNAVAILABLE when NFC is not enabled', async () => {
      mockNfcManager.isEnabled.mockResolvedValueOnce(false);
      await service.initialize();
      expect(service.getState()).toBe('NFC_UNAVAILABLE');
    });

    it('handles NFC disabled error', async () => {
      mockNfcManager.isEnabled.mockRejectedValueOnce(
        new Error('NFC disabled'),
      );
      await service.initialize();
      expect(service.getState()).toBe('NFC_UNAVAILABLE');
    });

    it('handles generic initialization errors', async () => {
      mockNfcManager.isEnabled.mockRejectedValueOnce(
        new Error('Something unexpected'),
      );
      await service.initialize();
      expect(service.getState()).toBe('NFC_DISABLED');
    });
  });

  describe('startListening', () => {
    it('transitions to DETECTING state', async () => {
      await service.initialize();
      await service.startListening();
      expect(service.getState()).toBe('DETECTING');
    });

    it('calls registerTagEvent', async () => {
      await service.initialize();
      await service.startListening();
      expect(mockNfcManager.registerTagEvent).toHaveBeenCalled();
    });

    it('sets up event listener', async () => {
      await service.initialize();
      await service.startListening();
      expect(mockNfcManager.setEventListener).toHaveBeenCalled();
    });

    it('does not start listening twice', async () => {
      await service.initialize();
      await service.startListening();
      await service.startListening();
      expect(mockNfcManager.registerTagEvent).toHaveBeenCalledTimes(1);
    });
  });

  describe('stopListening', () => {
    it('transitions to STOPPED state', async () => {
      await service.initialize();
      await service.startListening();
      await service.stopListening();
      expect(service.getState()).toBe('STOPPED');
    });

    it('calls unregisterTagEvent', async () => {
      await service.initialize();
      await service.startListening();
      await service.stopListening();
      expect(mockNfcManager.unregisterTagEvent).toHaveBeenCalled();
    });

    it('removes event listener', async () => {
      await service.initialize();
      await service.startListening();
      await service.stopListening();
      expect(mockNfcManager.setEventListener).toHaveBeenCalledWith(
        'NfcManagerDiscoverTag',
        null,
      );
    });

    it('handles stop when not listening', async () => {
      await service.stopListening();
      expect(service.getState()).toBe('INITIALIZING');
    });
  });

  describe('destroy', () => {
    it('clears all listeners', () => {
      const stateListener = jest.fn();
      const tagListener = jest.fn();
      const errorListener = jest.fn();

      service.onStateChange(stateListener);
      service.onTagDetected(tagListener);
      service.onError(errorListener);

      service.destroy();

      expect(stateListener).not.toHaveBeenCalled();
    });

    it('clears duplicate detector', () => {
      service.getDuplicateDetector().add('CARD_A');
      service.destroy();
      expect(service.getDuplicateDetector().size()).toBe(0);
    });
  });

  describe('listeners', () => {
    it('returns unsubscribe function for state changes', async () => {
      const listener = jest.fn();
      const unsub = service.onStateChange(listener);

      unsub();

      await service.initialize();
      expect(listener).not.toHaveBeenCalled();
    });

    it('returns unsubscribe function for tag detected', () => {
      const listener = jest.fn();
      const unsub = service.onTagDetected(listener);

      unsub();

      service['notifyTagDetected']({id: 'test'} as any);
      expect(listener).not.toHaveBeenCalled();
    });

    it('returns unsubscribe function for errors', () => {
      const listener = jest.fn();
      const unsub = service.onError(listener);

      unsub();

      service['notifyError']('test');
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('state machine transitions', () => {
    it('allows INITIALIZING -> READY', async () => {
      await service.initialize();
      expect(service.getState()).toBe('READY');
    });

    it('allows INITIALIZING -> NFC_UNAVAILABLE', async () => {
      mockNfcManager.isEnabled.mockResolvedValueOnce(false);
      await service.initialize();
      expect(service.getState()).toBe('NFC_UNAVAILABLE');
    });

    it('allows READY -> DETECTING via startListening', async () => {
      await service.initialize();
      await service.startListening();
      expect(service.getState()).toBe('DETECTING');
    });

    it('allows DETECTING -> STOPPED via stopListening', async () => {
      await service.initialize();
      await service.startListening();
      await service.stopListening();
      expect(service.getState()).toBe('STOPPED');
    });

    it('notifies state listeners on transitions', async () => {
      const listener = jest.fn();
      service.onStateChange(listener);

      await service.initialize();
      await service.startListening();

      expect(listener).toHaveBeenCalledWith('INITIALIZING');
      expect(listener).toHaveBeenCalledWith('READY');
      expect(listener).toHaveBeenCalledWith('DETECTING');
    });
  });

  describe('tag detection flow', () => {
    it('detects and processes a new card', async () => {
      await service.initialize();
      await service.startListening();

      const tag = {
        id: [0x04, 0xa1, 0xb2, 0xc3, 0xd4],
        techTypes: ['android.nfc.tech.NfcA'],
      };

      const tagDetectedSpy = jest.fn();
      service.onTagDetected(tagDetectedSpy);

      await service.handleTagDetected(tag);
      expect(tagDetectedSpy).toHaveBeenCalledTimes(1);
      expect(tagDetectedSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          uid: '04:A1:B2:C3:D4',
          readStatus: 'success',
        }),
      );
    });

    it('detects duplicate card and ignores it', async () => {
      await service.initialize();
      await service.startListening();

      const tag = {
        id: [0x04, 0xa1, 0xb2, 0xc3, 0xd4],
        techTypes: ['android.nfc.tech.NfcA'],
      };

      const tagDetectedSpy = jest.fn();
      service.onTagDetected(tagDetectedSpy);

      await service.handleTagDetected(tag);
      expect(tagDetectedSpy).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(2500);
      await Promise.resolve();

      await service.handleTagDetected(tag);
      expect(tagDetectedSpy).toHaveBeenCalledTimes(1);
    });

    it('detects different cards separately', async () => {
      await service.initialize();
      await service.startListening();

      const tagA = {
        id: [0x04, 0xa1, 0xb2, 0xc3, 0xd4],
        techTypes: ['android.nfc.tech.NfcA'],
      };
      const tagB = {
        id: [0x04, 0xe5, 0xf6, 0x07, 0x18],
        techTypes: ['android.nfc.tech.NfcA'],
      };

      const tagDetectedSpy = jest.fn();
      service.onTagDetected(tagDetectedSpy);

      await service.handleTagDetected(tagA);
      expect(tagDetectedSpy).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(2500);
      await Promise.resolve();

      await service.handleTagDetected(tagB);
      expect(tagDetectedSpy).toHaveBeenCalledTimes(2);
    });

    it('A -> B -> A returns only 2 unique cards', async () => {
      await service.initialize();
      await service.startListening();

      const tagA = {
        id: [0x04, 0xa1],
        techTypes: ['android.nfc.tech.NfcA'],
      };
      const tagB = {
        id: [0x04, 0xe5],
        techTypes: ['android.nfc.tech.NfcA'],
      };

      const tagDetectedSpy = jest.fn();
      service.onTagDetected(tagDetectedSpy);

      await service.handleTagDetected(tagA);
      expect(tagDetectedSpy).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(2500);
      await Promise.resolve();

      await service.handleTagDetected(tagB);
      expect(tagDetectedSpy).toHaveBeenCalledTimes(2);

      jest.advanceTimersByTime(2500);
      await Promise.resolve();

      await service.handleTagDetected(tagA);
      expect(tagDetectedSpy).toHaveBeenCalledTimes(2);
    });

    it('transitions through READING -> CARD_DETECTED', async () => {
      await service.initialize();
      await service.startListening();

      const tag = {
        id: [0x04, 0xa1],
        techTypes: ['android.nfc.tech.NfcA'],
      };

      await service.handleTagDetected(tag);
      expect(service.getState()).toBe('CARD_DETECTED');
    });

    it('transitions to READING during tag detection', async () => {
      await service.initialize();
      await service.startListening();

      const stateSpy = jest.fn();
      service.onStateChange(stateSpy);

      const tag = {
        id: [0x04, 0xa1],
        techTypes: ['android.nfc.tech.NfcA'],
      };

      const promise = service.handleTagDetected(tag);
      expect(stateSpy).toHaveBeenCalledWith('READING');
      await promise;
    });
  });
});
