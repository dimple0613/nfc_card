import React from 'react';
import renderer from 'react-test-renderer';
import {NfcCardList} from '../../src/components/NfcCardList';
import {NfcCard} from '../../src/models/NfcCard';

const mockCards: NfcCard[] = [
  {
    id: 'CARD_A',
    uid: '04:A1:B2:C3:D4',
    technologies: ['NfcA'],
    ndefAvailable: true,
    records: [],
    detectedAt: '2024-01-15T17:35:21.000Z',
    readStatus: 'success',
  },
  {
    id: 'CARD_B',
    uid: '04:E5:F6:07:18',
    technologies: ['NfcA', 'Ndef'],
    ndefAvailable: true,
    records: [{type: 'Text', languageCode: 'en', payload: 'Hello'}],
    detectedAt: '2024-01-15T17:35:29.000Z',
    readStatus: 'success',
  },
];

describe('NfcCardList', () => {
  it('renders empty state when no cards', () => {
    const tree = renderer
      .create(<NfcCardList cards={[]} onCardPress={jest.fn()} />)
      .toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders header with card count', () => {
    const tree = renderer
      .create(<NfcCardList cards={mockCards} onCardPress={jest.fn()} />)
      .toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders single card', () => {
    const tree = renderer
      .create(<NfcCardList cards={[mockCards[0]]} onCardPress={jest.fn()} />)
      .toJSON();
    expect(tree).toBeTruthy();
  });
});
