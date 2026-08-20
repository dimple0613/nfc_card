import React from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import {NfcCard} from '../models/NfcCard';
import {NfcCardItem} from './NfcCardItem';

interface NfcCardListProps {
  cards: NfcCard[];
  onCardPress: (card: NfcCard) => void;
}

export function NfcCardList({
  cards,
  onCardPress,
}: NfcCardListProps): React.JSX.Element {
  if (cards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No cards detected yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Detected Cards ({cards.length})</Text>
      <FlatList
        data={cards}
        keyExtractor={item => item.id}
        renderItem={({item, index}) => (
          <NfcCardItem card={item} index={index} onPress={onCardPress} />
        )}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
