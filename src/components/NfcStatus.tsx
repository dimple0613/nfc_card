import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {getNfcStatusMessage} from '../utils/nfcFormatter';

interface NfcStatusProps {
  state: string;
}

export function NfcStatus({state}: NfcStatusProps): React.JSX.Element {
  const {title, message, color} = getNfcStatusMessage(state);

  return (
    <View style={styles.container}>
      <View style={styles.indicatorRow}>
        <View style={[styles.dot, {backgroundColor: color}]} />
        <Text style={[styles.title, {color}]}>{title}</Text>
      </View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
