jest.mock('react-native-nfc-manager', () => {
  const nfcManager = {
    start: jest.fn().mockResolvedValue(undefined),
    isSupported: jest.fn().mockResolvedValue(true),
    isEnabled: jest.fn().mockResolvedValue(true),
    registerTagEvent: jest.fn().mockResolvedValue(undefined),
    unregisterTagEvent: jest.fn().mockResolvedValue(undefined),
    setEventListener: jest.fn(),
    setAlertMessage: jest.fn().mockResolvedValue(undefined),
    setAlertMessageIOS: jest.fn().mockResolvedValue(undefined),
    cancelTechnologyRequest: jest.fn().mockResolvedValue(undefined),
    getTag: jest.fn().mockResolvedValue(null),
    ndefHandler: {
      getNdefMessage: jest.fn().mockResolvedValue(null),
      writeNdefMessage: jest.fn().mockResolvedValue(undefined),
    },
  };

  return {
    __esModule: true,
    default: nfcManager,
    NfcEvents: {
      DiscoverTag: 'NfcManagerDiscoverTag',
      DiscoverBackgroundTag: 'NfcManagerDiscoverBackgroundTag',
      SessionClosed: 'NfcManagerSessionClosed',
      StateChanged: 'NfcManagerStateChanged',
    },
    NfcTech: {
      Ndef: 'Ndef',
      NfcA: 'NfcA',
      NfcB: 'NfcB',
      NfcF: 'NfcF',
      NfcV: 'NfcV',
      IsoDep: 'IsoDep',
    },
  };
});

jest.mock('react-native-screens', () => {
  return {
    enableScreens: jest.fn(),
    ScreenContainer: ({children}) => children,
    Screen: ({children}) => children,
    NativeScreen: ({children}) => children,
    ScreenStack: ({children}) => children,
    ScreenStackHeaderConfig: ({children}) => children,
  };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({children}) => children,
  SafeAreaView: ({children, style}) => {
    const React = require('react');
    const {View} = require('react-native');
    return React.createElement(View, {style}, children);
  },
  useSafeAreaInsets: () => ({top: 0, right: 0, bottom: 0, left: 0}),
  useSafeAreaFrame: () => ({x: 0, y: 0, width: 0, height: 0}),
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  NavigationContainer: ({children}) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));
