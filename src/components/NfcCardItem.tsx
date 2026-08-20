import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {NfcCard} from '../models/NfcCard';
import {formatUid, formatTechnologies, formatTimestamp} from '../utils/nfcFormatter';

interface NfcCardItemProps {
  card: NfcCard;
  index: number;
  onPress: (card: NfcCard) => void;
}

export function NfcCardItem({
  card,
  index,
  onPress,
}: NfcCardItemProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(card)}
      activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.cardNumber}>Card {index + 1}</Text>
        <View
          style={[
            styles.statusBadge,
            card.readStatus === 'success'
              ? styles.successBadge
              : styles.errorBadge,
          ]}>
          <Text style={styles.statusText}>
            {card.readStatus === 'success' ? 'Read OK' : 'Failed'}
          </Text>
        </View>
      </View>
      <Text style={styles.uid}>UID: {formatUid(card.uid)}</Text>
      <Text style={styles.tech}>{formatTechnologies(card.technologies)}</Text>
      <Text style={styles.time}>{formatTimestamp(card.detectedAt)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  successBadge: {
    backgroundColor: '#D1FAE5',
  },
  errorBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
  },
  uid: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  tech: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
