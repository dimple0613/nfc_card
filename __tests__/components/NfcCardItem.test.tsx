import React from 'react';
import renderer from 'react-test-renderer';
import {NfcCardItem} from '../../src/components/NfcCardItem';
import {NfcCard} from '../../src/models/NfcCard';

const mockCard: NfcCard = {
  id: '04:A1:B2:C3:D4',
  uid: '04:A1:B2:C3:D4',
  technologies: ['NfcA', 'Ndef'],
  ndefAvailable: true,
  records: [{type: 'Text', languageCode: 'en', payload: 'Hello'}],
  detectedAt: '2024-01-15T17:35:21.000Z',
  readStatus: 'success',
};

const mockFailedCard: NfcCard = {
  id: 'error-123',
  uid: null,
  technologies: [],
  ndefAvailable: false,
  records: [],
  detectedAt: '2024-01-15T17:35:30.000Z',
  readStatus: 'failed',
  errorMessage: 'Read timeout',
};

describe('NfcCardItem', () => {
  it('renders successfully with a valid card', () => {
    const tree = renderer
      .create(<NfcCardItem card={mockCard} index={0} onPress={jest.fn()} />)
      .toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders with a failed card', () => {
    const tree = renderer
      .create(
        <NfcCardItem card={mockFailedCard} index={0} onPress={jest.fn()} />,
      )
      .toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders correct index', () => {
    const tree = renderer
      .create(<NfcCardItem card={mockCard} index={2} onPress={jest.fn()} />)
      .toJSON();
    expect(tree).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const tree = renderer.create(
      <NfcCardItem card={mockCard} index={0} onPress={onPress} />,
    );
    const instance = tree.root;
    const touchable = instance.findByProps({activeOpacity: 0.7});
    touchable.props.onPress();
    expect(onPress).toHaveBeenCalledWith(mockCard);
  });
});
