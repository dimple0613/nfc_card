import React from 'react';
import {View, ScrollView, Text, StyleSheet, SafeAreaView} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../App';
import {formatUid, formatTechnologies, formatTimestamp, formatRecordPayload, formatBytes, bytesToAscii} from '../utils/nfcFormatter';

type Props = NativeStackScreenProps<RootStackParamList, 'CardDetails'>;

export function NfcCardDetailsScreen({route}: Props): React.JSX.Element {
  const {card} = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>NFC Card Details</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>UID</Text>
            <Text style={styles.fieldValue}>{formatUid(card.uid)}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Technology</Text>
            <Text style={styles.fieldValue}>
              {formatTechnologies(card.technologies)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>NDEF</Text>
            <Text style={styles.fieldValue}>
              {card.ndefAvailable ? 'Available' : 'Not available'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Records</Text>
            <Text style={styles.fieldValue}>{card.records.length}</Text>
          </View>

          {card.records.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Records</Text>
              {card.records.map((record, index) => (
                <View key={index} style={styles.recordContainer}>
                  <Text style={styles.recordTitle}>Record {index + 1}</Text>
                  <View style={styles.recordField}>
                    <Text style={styles.recordLabel}>Type:</Text>
                    <Text style={styles.recordValue}>{record.type}</Text>
                  </View>
                  {record.mimeType && (
                    <View style={styles.recordField}>
                      <Text style={styles.recordLabel}>MIME:</Text>
                      <Text style={styles.recordValue}>{record.mimeType}</Text>
                    </View>
                  )}
                  {record.languageCode && (
                    <View style={styles.recordField}>
                      <Text style={styles.recordLabel}>Language:</Text>
                      <Text style={styles.recordValue}>
                        {record.languageCode}
                      </Text>
                    </View>
                  )}
                  <View style={styles.recordField}>
                    <Text style={styles.recordLabel}>Payload:</Text>
                    <Text style={styles.recordValue}>
                      {formatRecordPayload(record.payload)}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Detected At</Text>
            <Text style={styles.fieldValue}>
              {formatTimestamp(card.detectedAt)}
            </Text>
          </View>

          {card.memory && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Memory</Text>
              <View style={styles.recordContainer}>
                <View style={styles.recordField}>
                  <Text style={styles.recordLabel}>Capacity:</Text>
                  <Text style={styles.recordValue}>
                    {formatBytes(card.memory.maxSize)}
                  </Text>
                </View>
                <View style={styles.recordField}>
                  <Text style={styles.recordLabel}>Used:</Text>
                  <Text style={styles.recordValue}>
                    {formatBytes(card.memory.usedBytes)} (approx)
                  </Text>
                </View>
                <View style={styles.recordField}>
                  <Text style={styles.recordLabel}>Free:</Text>
                  <Text style={styles.recordValue}>
                    {formatBytes(Math.max(0, card.memory.maxSize - card.memory.usedBytes))}
                  </Text>
                </View>
                <View style={styles.recordField}>
                  <Text style={styles.recordLabel}>Writable:</Text>
                  <Text style={styles.recordValue}>
                    {card.memory.writable ? 'Yes' : 'No'}
                  </Text>
                </View>
                <View style={styles.recordField}>
                  <Text style={styles.recordLabel}>Formattable:</Text>
                  <Text style={styles.recordValue}>
                    {card.memory.canFormat ? 'Yes' : 'No'}
                  </Text>
                </View>
              </View>
            </>
          )}

          {card.tagInfo && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Chip Info</Text>
              <View style={styles.recordContainer}>
                {card.tagInfo.manufacturer && (
                  <View style={styles.recordField}>
                    <Text style={styles.recordLabel}>Maker:</Text>
                    <Text style={styles.recordValue}>{card.tagInfo.manufacturer}</Text>
                  </View>
                )}
                {card.tagInfo.atqa && (
                  <View style={styles.recordField}>
                    <Text style={styles.recordLabel}>ATQA:</Text>
                    <Text style={styles.recordValue}>{card.tagInfo.atqa}</Text>
                  </View>
                )}
                {card.tagInfo.sak && (
                  <View style={styles.recordField}>
                    <Text style={styles.recordLabel}>SAK:</Text>
                    <Text style={styles.recordValue}>{card.tagInfo.sak}</Text>
                  </View>
                )}
                {card.tagInfo.dsfId && (
                  <View style={styles.recordField}>
                    <Text style={styles.recordLabel}>DSF ID:</Text>
                    <Text style={styles.recordValue}>{card.tagInfo.dsfId}</Text>
                  </View>
                )}
                {card.tagInfo.historicalBytes && (
                  <View style={styles.recordField}>
                    <Text style={styles.recordLabel}>Hist. bytes:</Text>
                    <Text style={styles.recordValue}>{card.tagInfo.historicalBytes}</Text>
                  </View>
                )}
                {card.tagInfo.maxTransceiveLength != null && (
                  <View style={styles.recordField}>
                    <Text style={styles.recordLabel}>Max frame:</Text>
                    <Text style={styles.recordValue}>
                      {card.tagInfo.maxTransceiveLength} bytes
                    </Text>
                  </View>
                )}
              </View>
            </>
          )}

          {card.rawDump && card.rawDump.units.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>
                Raw Memory Dump ({card.rawDump.technology})
                {card.rawDump.truncated ? ' - partial' : ''}
              </Text>
              <View style={styles.dumpContainer}>
                {card.rawDump.units.map(unit => (
                  <View key={unit.index} style={styles.dumpRow}>
                    <Text style={styles.dumpIndex}>
                      {card.rawDump!.unitLabel === 'page' ? 'P' : 'B'}
                      {unit.index.toString().padStart(3, '0')}
                    </Text>
                    <View style={styles.dumpData}>
                      <Text style={styles.dumpHex}>{unit.hex}</Text>
                      <Text style={styles.dumpAscii}>|{bytesToAscii(
                        unit.hex.split(' ').filter(Boolean).map(h => parseInt(h, 16)),
                      )}|</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Status</Text>
            <Text
              style={[
                styles.fieldValue,
                card.readStatus === 'success'
                  ? styles.successText
                  : styles.errorText,
              ]}>
              {card.readStatus === 'success'
                ? 'Successfully Read'
                : `Read Failed: ${card.errorMessage || 'Unknown error'}`}
            </Text>
          </View>
        </View>
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
  },
  card: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  field: {
    paddingVertical: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    paddingVertical: 12,
  },
  recordContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  recordField: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  recordLabel: {
    fontSize: 13,
    color: '#6B7280',
    width: 80,
  },
  recordValue: {
    fontSize: 13,
    color: '#1F2937',
    flex: 1,
  },
  successText: {
    color: '#065F46',
  },
  errorText: {
    color: '#991B1B',
  },
  dumpContainer: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  dumpRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  dumpIndex: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#9CA3AF',
    width: 36,
  },
  dumpData: {
    flex: 1,
  },
  dumpHex: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#D1FAE5',
  },
  dumpAscii: {
    fontSize: 9,
    fontFamily: 'monospace',
    color: '#6B7280',
  },
});
