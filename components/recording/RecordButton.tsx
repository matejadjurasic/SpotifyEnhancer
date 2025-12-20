import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../styles/colors';

interface RecordButtonProps {
  isRecording: boolean;
  isUploading: boolean;
  onPress: () => void;
  disabled: boolean;
}

export const RecordButton: React.FC<RecordButtonProps> = ({ 
  isRecording, 
  isUploading, 
  onPress, 
  disabled 
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, isRecording && styles.buttonActive]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.buttonInner}>
        {isUploading ? (
          <ActivityIndicator color={colors.text} size="large" />
        ) : (
          <Text style={styles.buttonText}>
            {isRecording ? '⏹ Stop' : '🎙 Record'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonActive: {
    backgroundColor: colors.danger,
    shadowColor: colors.danger,
  },
  buttonInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
});
