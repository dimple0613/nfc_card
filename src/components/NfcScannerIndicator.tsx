import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';

interface NfcScannerIndicatorProps {
  isActive: boolean;
}

export function NfcScannerIndicator({
  isActive,
}: NfcScannerIndicatorProps): React.JSX.Element | null {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isActive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive, pulseAnim]);

  if (!isActive) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.ring, {opacity: pulseAnim}]} />
      <Animated.View style={[styles.ringOuter, {opacity: pulseAnim}]} />
      <Text style={styles.label}>Automatically detecting...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  ring: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  ringOuter: {
    position: 'absolute',
    top: 0,
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  label: {
    marginTop: 12,
    fontSize: 13,
    color: '#6B7280',
  },
});
