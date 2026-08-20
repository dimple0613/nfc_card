import React, {useCallback} from 'react';
import {View, ScrollView, StyleSheet, Text, SafeAreaView} from 'react-native';
import {NfcStatus} from '../components/NfcStatus';
import {NfcScannerIndicator} from '../components/NfcScannerIndicator';
import {NfcCardList} from '../components/NfcCardList';
import {useNfcScanner} from '../hooks/useNfcScanner';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../App';
import {NfcCard} from '../models/NfcCard';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export function HomeScreen({navigation}: HomeScreenProps): React.JSX.Element {
  const {state, cards, error, detectedCount} = useNfcScanner();

  const handleCardPress = useCallback(
    (card: NfcCard) => {
      navigation.navigate('CardDetails', {card});
    },
    [navigation],
  );

  const isDetecting = state === 'DETECTING' || state === 'READY';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>NFC CARD SCANNER</Text>
        </View>

        <NfcStatus state={state} />

        <NfcScannerIndicator isActive={isDetecting} />

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.counterContainer}>
          <Text style={styles.counterLabel}>Detected Cards</Text>
          <Text style={styles.counterValue}>{detectedCount}</Text>
        </View>

        <NfcCardList cards={cards} onCardPress={handleCardPress} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  header: {
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 1,
  },
  errorContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    fontSize: 13,
    color: '#991B1B',
  },
  counterContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  counterLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  counterValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1F2937',
  },
});
