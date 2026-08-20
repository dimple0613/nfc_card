import React from 'react';
import renderer from 'react-test-renderer';
import {NfcStatus} from '../../src/components/NfcStatus';

describe('NfcStatus', () => {
  it('renders READY state', () => {
    const tree = renderer.create(<NfcStatus state="READY" />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders INITIALIZING state', () => {
    const tree = renderer.create(<NfcStatus state="INITIALIZING" />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders NFC_UNAVAILABLE state', () => {
    const tree = renderer.create(
      <NfcStatus state="NFC_UNAVAILABLE" />,
    ).toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders NFC_DISABLED state', () => {
    const tree = renderer.create(<NfcStatus state="NFC_DISABLED" />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders READING state', () => {
    const tree = renderer.create(<NfcStatus state="READING" />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders ERROR state', () => {
    const tree = renderer.create(<NfcStatus state="ERROR" />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders STOPPED state', () => {
    const tree = renderer.create(<NfcStatus state="STOPPED" />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders DETECTING state', () => {
    const tree = renderer.create(<NfcStatus state="DETECTING" />).toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders DUPLICATE_CARD state', () => {
    const tree = renderer.create(
      <NfcStatus state="DUPLICATE_CARD" />,
    ).toJSON();
    expect(tree).toBeTruthy();
  });

  it('renders CARD_DETECTED state', () => {
    const tree = renderer.create(
      <NfcStatus state="CARD_DETECTED" />,
    ).toJSON();
    expect(tree).toBeTruthy();
  });
});
