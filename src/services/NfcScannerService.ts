import NfcManager, {NfcEvents, NdefRecord} from 'react-native-nfc-manager';
import {NfcCard, NfcScannerState} from '../models/NfcCard';
import {parseNfcTag} from './NfcParser';
import {readFullTagDetails} from './TagReader';
import {NfcDuplicateDetector} from './NfcDuplicateDetector';

type StateChangeListener = (state: NfcScannerState) => void;
type TagDetectedListener = (card: NfcCard) => void;
type ErrorListener = (error: string) => void;

export class NfcScannerService {
  private state: NfcScannerState = 'INITIALIZING';
  private duplicateDetector: NfcDuplicateDetector = new NfcDuplicateDetector();
  private stateListeners: Set<StateChangeListener> = new Set();
  private tagDetectedListeners: Set<TagDetectedListener> = new Set();
  private errorListeners: Set<ErrorListener> = new Set();
  private isListeningActive = false;

  constructor() {
    this.log('[NFC] Service created');
  }

  private log(message: string): void {
    if (__DEV__) {
      console.log(message);
    }
  }

  private setState(newState: NfcScannerState): void {
    this.log(`[NFC] State: ${this.state} -> ${newState}`);
    this.state = newState;
    this.stateListeners.forEach(listener => listener(newState));
  }

  onStateChange(listener: StateChangeListener): () => void {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  onTagDetected(listener: TagDetectedListener): () => void {
    this.tagDetectedListeners.add(listener);
    return () => {
      this.tagDetectedListeners.delete(listener);
    };
  }

  onError(listener: ErrorListener): () => void {
    this.errorListeners.add(listener);
    return () => {
      this.errorListeners.delete(listener);
    };
  }

  getState(): NfcScannerState {
    return this.state;
  }

  getDuplicateDetector(): NfcDuplicateDetector {
    return this.duplicateDetector;
  }

  async initialize(): Promise<void> {
    this.log('[NFC] Initializing');
    this.setState('INITIALIZING');

    try {
      await NfcManager.start();
      const isSupported = await NfcManager.isEnabled();

      if (!isSupported) {
        this.log('[NFC] NFC not supported or not enabled');
        this.setState('NFC_UNAVAILABLE');
        return;
      }

      this.log('[NFC] NFC available and enabled');
      this.setState('READY');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Unknown initialization error';

      if (
        errorMessage.includes('not supported') ||
        errorMessage.includes('NFC disabled')
      ) {
        this.log('[NFC] NFC not available on this device');
        this.setState('NFC_UNAVAILABLE');
      } else {
        this.log(`[NFC] Initialization error: ${errorMessage}`);
        this.setState('NFC_DISABLED');
      }
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      return await NfcManager.isEnabled();
    } catch {
      return false;
    }
  }

  async startListening(): Promise<void> {
    if (this.isListeningActive) {
      this.log('[NFC] Already listening, skipping');
      return;
    }

    this.log('[NFC] Starting listener');
    this.setState('DETECTING');

    try {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: unknown) => {
        this.handleTagDetected(tag);
      });

      await NfcManager.registerTagEvent({
        invalidateAfterFirstRead: false,
      });
      this.isListeningActive = true;
      this.log('[NFC] Listener started');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown listen error';
      this.log(`[NFC] Start listening error: ${errorMessage}`);
      this.setState('ERROR');
      this.notifyError(errorMessage);
      this.isListeningActive = false;
    }
  }

  async stopListening(): Promise<void> {
    if (!this.isListeningActive) {
      return;
    }

    this.log('[NFC] Stopping listener');
    this.isListeningActive = false;

    try {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      await NfcManager.unregisterTagEvent();
      this.setState('STOPPED');
      this.log('[NFC] Listener stopped');
    } catch (error) {
      this.log(
        `[NFC] Stop listening error: ${
          error instanceof Error ? error.message : 'Unknown'
        }`,
      );
    }
  }

  async handleTagDetected(rawTag: unknown): Promise<void> {
    this.log('[NFC] Tag detected');
    this.setState('READING');

    try {
      const tagObj = rawTag as Record<string, unknown>;
      const uid = tagObj.id
        ? Array.isArray(tagObj.id)
          ? (tagObj.id as number[])
              .map((b: number) =>
                b.toString(16).padStart(2, '0').toUpperCase(),
              )
              .join(':')
          : String(tagObj.id)
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
      let records: NdefRecord[] = [];

      try {
        const ndefResult = await NfcManager.ndefHandler.getNdefMessage();
        if (ndefResult && ndefResult.ndefMessage && ndefResult.ndefMessage.length > 0) {
          ndefAvailable = true;
          records = ndefResult.ndefMessage;
        }
      } catch {
        this.log('[NFC] NDEF not available on this tag');
      }

      const enrichedTag = {
        ...tagObj,
        ndefMessage: ndefAvailable ? records : undefined,
      };

      const card = parseNfcTag(enrichedTag);

      try {
        const fullDetails = await readFullTagDetails(tagObj);
        card.memory = fullDetails.memory;
        card.tagInfo = fullDetails.tagInfo;
        card.rawDump = fullDetails.rawDump;
      } catch (detailsError) {
        this.log(
          `[NFC] Full details read error: ${
            detailsError instanceof Error ? detailsError.message : 'Unknown'
          }`,
        );
      }

      if (this.duplicateDetector.hasCardBeenDetected(card.id)) {
        this.log(`[NFC] Duplicate card: ${card.id}`);
        this.setState('DUPLICATE_CARD');
        setTimeout(() => {
          this.setState('DETECTING');
          this.resumeListening();
        }, 1500);
        return;
      }

      this.duplicateDetector.add(card.id);
      this.log(`[NFC] Card added: ${card.id}`);
      this.setState('CARD_DETECTED');
      this.notifyTagDetected(card);

      setTimeout(() => {
        this.setState('DETECTING');
        this.resumeListening();
      }, 2000);
    } catch (error) {
      this.log(
        `[NFC] Tag processing error: ${
          error instanceof Error ? error.message : 'Unknown'
        }`,
      );
      this.setState('ERROR');
      this.notifyError(
        error instanceof Error ? error.message : 'Failed to process NFC tag',
      );

      setTimeout(() => {
        this.setState('DETECTING');
        this.resumeListening();
      }, 1500);
    }
  }

  private async resumeListening(): Promise<void> {
    try {
      await NfcManager.registerTagEvent({
        invalidateAfterFirstRead: false,
      });
      this.log('[NFC] Resumed listening');
    } catch (error) {
      this.log(
        `[NFC] Resume listening error: ${
          error instanceof Error ? error.message : 'Unknown'
        }`,
      );
    }
  }

  private notifyTagDetected(card: NfcCard): void {
    this.tagDetectedListeners.forEach(listener => listener(card));
  }

  private notifyError(message: string): void {
    this.errorListeners.forEach(listener => listener(message));
  }

  destroy(): void {
    this.log('[NFC] Destroying service');
    this.stopListening();
    this.stateListeners.clear();
    this.tagDetectedListeners.clear();
    this.errorListeners.clear();
    this.duplicateDetector.clear();
  }
}
