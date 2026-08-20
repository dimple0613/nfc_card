import React from 'react';
import {View, ScrollView, Text, StyleSheet, SafeAreaView} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../App';
import {formatUid, formatTechnologies, formatTimestamp, formatRecordPayload} from '../utils/nfcFormatter';

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
});
