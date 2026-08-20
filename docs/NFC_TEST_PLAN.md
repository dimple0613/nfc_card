# NFC Physical Test Plan

## Requirements

- Android phone with NFC enabled
- Minimum 3 NFC cards/tags with different UIDs
- Application built and installed on device

## Test Matrix

| Test | Device | NFC | Card | Expected | Actual | Status |
|------|--------|-----|------|----------|--------|--------|
| Auto detect | Android | ON | A | Detect | | NOT TESTED |
| Second card | Android | ON | B | Detect | | NOT TESTED |
| Third card | Android | ON | C | Detect | | NOT TESTED |
| Duplicate | Android | ON | A | One entry | | NOT TESTED |
| A->B->C | Android | ON | A/B/C | 3 cards | | NOT TESTED |
| A->B->A | Android | ON | A/B | 2 cards | | NOT TESTED |
| NFC disabled | Android | OFF | A | Error state | | NOT TESTED |
| NFC re-enabled | Android | ON | A | Ready | | NOT TESTED |
| App restart | Android | ON | A | Detect | | NOT TESTED |
| Background | Android | ON | A | Restore | | NOT TESTED |
| Unsupported tag | Android | ON | Unknown | Error + continue | | NOT TESTED |
| Rapid cards | Android | ON | A/B | 2 cards | | NOT TESTED |

## Test 1: Automatic Detection

1. Open app
2. Do NOT press any scan button
3. Bring phone near Card A
4. Verify Card A appears automatically in list

**Expected:** Card A detected without user interaction

## Test 2: Second Card Detection

1. Move phone away from Card A
2. Move phone near Card B
3. Verify Card B appears in list

**Expected:** Card B detected, list shows 2 cards

## Test 3: Third Card Detection

1. Move phone away from Card B
2. Move phone near Card C
3. Verify Card C appears in list

**Expected:** Card C detected, list shows 3 cards

## Test 4: Duplicate Prevention

1. Keep phone near Card A for 10-20 seconds
2. Observe detected card list

**Expected:** Card A appears ONCE in list

## Test 5: A -> B -> C Sequence

1. Present Card A, wait for detection
2. Present Card B, wait for detection
3. Present Card C, wait for detection

**Expected:** Detected Cards: 3

## Test 6: A -> B -> A Sequence

1. Present Card A, wait for detection
2. Present Card B, wait for detection
3. Present Card A again

**Expected:** Detected Cards: 2 (Card A counted once)

## Test 7: NFC Disabled

1. Disable NFC in Android Settings
2. Open/restart app

**Expected:** "NFC is disabled" message, no crash

## Test 8: NFC Re-enabled

1. Enable NFC in Android Settings
2. Return to app

**Expected:** NFC READY, automatic detection resumes

## Test 9: Unsupported Tag

1. Present an unsupported NFC tag
2. Observe behavior

**Expected:** Error message displayed, app continues waiting

## Test 10: Read Failure Recovery

1. Present a tag partially to trigger read failure
2. Observe recovery

**Expected:** Error state, then returns to detecting state

## Test 11: App Background/Foreground

1. Start app, detect Card A
2. Press home button (background)
3. Return to app
4. Present Card B

**Expected:** NFC resumes, Card B detected, no duplicate Card A

## Test 12: App Restart

1. Start app, detect Card A
2. Close app completely
3. Reopen app
4. Present Card A

**Expected:** Fresh session, Card A detected (previous session cleared)

## Notes

- All tests should be performed on a real Android device
- Emulators do not support NFC hardware
- NFC detection range is typically 1-4 cm
- Hold phone steady near card for 1-2 seconds for reliable detection
- Record actual UIDs of test cards for verification
