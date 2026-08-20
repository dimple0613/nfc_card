import {useState, useEffect, useCallback, useRef} from 'react';
import {NfcCard, NfcScannerState} from '../models/NfcCard';
import {NfcScannerService} from '../services/NfcScannerService';

interface UseNfcScannerResult {
  state: NfcScannerState;
  cards: NfcCard[];
  error: string | null;
  isNfcAvailable: boolean;
  isNfcEnabled: boolean;
  detectedCount: number;
  clearCards: () => void;
}

export function useNfcScanner(): UseNfcScannerResult {
  const [state, setState] = useState<NfcScannerState>('INITIALIZING');
  const [cards, setCards] = useState<NfcCard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isNfcAvailable, setIsNfcAvailable] = useState(false);
  const [isNfcEnabled, setIsNfcEnabled] = useState(false);
  const serviceRef = useRef<NfcScannerService | null>(null);

  useEffect(() => {
    const service = new NfcScannerService();
    serviceRef.current = service;

    const unsubState = service.onStateChange((newState: NfcScannerState) => {
      setState(newState);
      setIsNfcAvailable(
        newState !== 'NFC_UNAVAILABLE' && newState !== 'INITIALIZING',
      );
      setIsNfcEnabled(
        newState !== 'NFC_DISABLED' &&
          newState !== 'NFC_UNAVAILABLE' &&
          newState !== 'INITIALIZING',
      );
    });

    const unsubTag = service.onTagDetected((card: NfcCard) => {
      setCards(prev => [...prev, card]);
      setError(null);
    });

    const unsubError = service.onError((errorMessage: string) => {
      setError(errorMessage);
    });

    service.initialize().then(() => {
      service.startListening();
    });

    return () => {
      unsubState();
      unsubTag();
      unsubError();
      service.destroy();
    };
  }, []);

  const clearCards = useCallback(() => {
    setCards([]);
    if (serviceRef.current) {
      serviceRef.current.getDuplicateDetector().clear();
    }
  }, []);

  return {
    state,
    cards,
    error,
    isNfcAvailable,
    isNfcEnabled,
    detectedCount: cards.length,
    clearCards,
  };
}
