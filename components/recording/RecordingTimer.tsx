import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { RECORDING_CONFIG } from '../../config/constants';
import { colors } from '../../styles/colors';

interface RecordingTimerProps {
  seconds: number;
}

export const RecordingTimer: React.FC<RecordingTimerProps> = ({ seconds }) => {
  if (seconds === 0) return null;

  return (
    <Text style={styles.timer}>
      {seconds}s / {RECORDING_CONFIG.MAX_DURATION_SECONDS}s
    </Text>
  );
};

const styles = StyleSheet.create({
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 40,
  },
});