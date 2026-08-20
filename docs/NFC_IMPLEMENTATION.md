# NFC Implementation Documentation

## Architecture Overview

```
src/
├── models/
│   └── NfcCard.ts              # Type definitions and interfaces
├── services/
│   ├── NfcScannerService.ts    # Core NFC service (listener, lifecycle)
│   ├── NfcParser.ts            # NFC tag data parsing
│   └── NfcDuplicateDetector.ts # Duplicate card prevention
├── hooks/
│   └── useNfcScanner.ts        # React hook for NFC state
├── components/
│   ├── NfcStatus.tsx           # NFC status indicator
│   ├── NfcScannerIndicator.tsx # Pulse animation when scanning
│   ├── NfcCardItem.tsx         # Single card display
│   └── NfcCardList.tsx         # Card list with FlatList
├── screens/
│   ├── HomeScreen.tsx          # Main scanner screen
│   └── NfcCardDetailsScreen.tsx # Card detail view
├── utils/
│   └── nfcFormatter.ts         # Formatting helpers
└── __tests__/
    ├── nfcParser.test.ts
    ├── nfcDuplicateDetector.test.ts
    ├── nfcScannerService.test.ts
    ├── nfcFormatter.test.ts
    └── components/
        ├── NfcStatus.test.tsx
        ├── NfcCardItem.test.tsx
        └── NfcCardList.test.tsx
```

## Dependencies

- `react-native` 0.75.4
- `react-native-nfc-manager` - NFC abstraction layer
- `@react-navigation/native` + `@react-navigation/native-stack` - Navigation
- `react-native-screens` / `react-native-safe-area-context` - Navigation deps

## Android Implementation

### Manifest Configuration

- `android.permission.NFC` permission
- `<uses-feature android:name="android.hardware.nfc" android:required="true" />`
- Intent filters for `TECH_DISCOVERED`, `NDEF_DISCOVERED`, and `TAG_DISCOVERED`
- Tech filter XML (`nfc_tech_filter.xml`) covering all standard NFC technologies:
  - IsoDep, NfcA, NfcB, NfcF, NfcV
  - Ndef, NdefFormatable
  - MifareClassic, MifareUltralight
  - NfcBarcode

### NFC Lifecycle

1. **App Launch** → `NfcScannerService.initialize()`
2. **NFC Check** → Verify hardware + enabled status
3. **Start Listening** → `startTagDiscovery()` registers foreground dispatch
4. **Tag Detected** → `handleTagDetected()` processes tag data
5. **Read NDEF** → Extract NDEF records if available
6. **Duplicate Check** → Verify card not already in session
7. **Add Card** → Notify UI, update card list
8. **Resume Listening** → Re-register for next card
9. **App Background** → `stopListening()` cleans up
10. **App Foreground** → Re-initialize and start listening

### Automatic Detection Flow

The application uses Android's foreground NFC dispatch system. When the app is in the foreground:
- NFC events are routed to the current activity
- No user interaction (button press) is needed
- Cards are detected, read, and processed automatically
- After processing, the scanner resumes listening for the next card

## iOS Implementation

### Limitations

iOS Core NFC has significant restrictions compared to Android:

1. **No automatic background detection** - iOS requires starting an NFC scanning session explicitly
2. **Session-based scanning** - Each scan session must be started programmatically
3. **User interaction required** - iOS shows a system dialog when scanning begins
4. **Session timeout** - NFC sessions have a limited duration (~60 seconds)
5. **Tag re-read limitation** - Once a tag is read, it may require moving the phone away and back

### Supported iOS Behavior

The app implements the maximum iOS support:
- NFC availability check
- Manual scan initiation (required by iOS platform)
- NDEF reading
- Tag technology identification
- Clear display of platform limitations

### Configuration

- `Info.plist`: `NFCReaderUsageDescription` for NFC permission dialog
- Xcode: Enable "Near Field Communication Tag Reading" capability

## NFC State Machine

```
INITIALIZING
    ↓
READY ←──────────────────┐
    ↓                     │
DETECTING ────────────────┤
    ↓                     │
READING                   │
    ↓                     │
CARD_DETECTED ────────────┘
    ↓
DUPLICATE_CARD ───────────┘
    ↓
ERROR ────────────────────┘
    ↓
STOPPED
```

### State Descriptions

| State | Description |
|-------|-------------|
| INITIALIZING | NFC service starting up |
| NFC_UNAVAILABLE | Device lacks NFC hardware |
| NFC_DISABLED | NFC is turned off |
| READY | NFC initialized, ready to listen |
| DETECTING | Listening for NFC tags |
| READING | Processing a detected tag |
| CARD_DETECTED | Tag successfully read |
| DUPLICATE_CARD | Same card detected again |
| ERROR | Read failed, will retry |
| STOPPED | Scanner stopped |

## Duplicate Prevention

Uses a `Set<string>` keyed by card UID (or generated fallback ID):

```typescript
const detectedCardIds = new Set<string>();

// Before adding
if (detectedCardIds.has(cardId)) {
  return; // Skip duplicate
}
detectedCardIds.add(cardId);
```

### Fallback Strategy

When UID is not available:
- Generates ID from timestamp + technology hash
- Different tags without UIDs produce different IDs

## Supported Technologies

| Technology | Read | Write | Notes |
|------------|------|-------|-------|
| NFC-A (ISO 14443-3A) | Yes | No | Most common |
| NFC-B (ISO 14443-3B) | Yes | No | |
| NFC-F (FeliCa) | Yes | No | |
| NFC-V (ISO 15693) | Yes | No | |
| ISO-DEP | Yes | No | |
| NDEF | Yes | No | |
| Mifare Classic | Yes | No | Read UID only |
| Mifare Ultralight | Yes | No | Read UID only |

## Testing

### Unit Tests
- `nfcDuplicateDetector.test.ts` - Duplicate detection logic
- `nfcParser.test.ts` - Tag parsing, NDEF record parsing
- `nfcScannerService.test.ts` - Service lifecycle, state transitions
- `nfcFormatter.test.ts` - Display formatting

### Component Tests
- `NfcStatus.test.tsx` - Status display for all states
- `NfcCardItem.test.tsx` - Card rendering
- `NfcCardList.test.tsx` - Card list with empty state

### Run Tests
```bash
npm test                  # Run all tests
npm run test:unit         # Unit tests only
npm run test:coverage     # With coverage report
```

## Troubleshooting

### NFC not detecting cards
1. Verify NFC is enabled in device settings
2. Check that `android.hardware.nfc` feature is declared
3. Ensure foreground dispatch is registered
4. Check logcat for `[NFC]` prefixed messages

### Duplicate cards appearing
- Ensure `NfcDuplicateDetector` is being used
- Check that card IDs are consistent
- Verify `clear()` is only called intentionally

### App crashes on NFC read
- Verify tag type is supported
- Check NDEF availability before reading records
- Ensure error handling catches all exceptions
