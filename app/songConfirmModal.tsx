import React from 'react';
import {
    ImageBackground,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type Props = {
  visible: boolean;
  data: {
    track: string;
    artist: string;
    photoUrl?: string | null;
  };
  onYes: () => void;
  onNo: () => void;
};

export const SongConfirmModal = ({ visible, data, onYes, onNo }: Props) => {
  const content = (
    <View style={styles.content}>
      <Text style={styles.track}>{data.track}</Text>
      <Text style={styles.artist}>{data.artist}</Text>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.yes} onPress={onYes}>
          <Text style={styles.btnText}>Yes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.no} onPress={onNo}>
          <Text style={styles.btnText}>No</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      {data.photoUrl ? (
        <ImageBackground source={{ uri: data.photoUrl }} style={styles.bg} blurRadius={8}>
          {content}
        </ImageBackground>
      ) : (
        <View style={[styles.bg, styles.noImage]}>
          {content}
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#000',
  },
  noImage: {
    backgroundColor: '#111',
  },
  content: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 16,
    padding: 24,
  },
  track: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  artist: {
    fontSize: 18,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  yes: {
    backgroundColor: '#1DB954',
    padding: 12,
    borderRadius: 8,
    width: 100,
  },
  no: {
    backgroundColor: '#444',
    padding: 12,
    borderRadius: 8,
    width: 100,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});

