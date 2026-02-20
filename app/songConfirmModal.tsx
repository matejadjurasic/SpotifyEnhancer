import React from "react";
import {
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  data: {
    track: string;
    artist: string;
    photoUrl?: string | null;
  };
  onConfirm: () => void;
};

export const SongConfirmModal = ({ visible, data, onConfirm }: Props) => {
  const content = (
    <View style={styles.content}>
      <Text style={styles.track}>{data.track}</Text>
      <Text style={styles.artist}>{data.artist}</Text>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.confirm} onPress={onConfirm}>
          <Text style={styles.btnText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.popup}>
          {data.photoUrl ? (
            <ImageBackground
              source={{ uri: data.photoUrl }}
              style={styles.image}
              resizeMode="contain"
              blurRadius={2}
            />
          ) : null}

          <View style={styles.content}>{content}</View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  popup: {
    width: "85%",
    maxWidth: 420,
    borderRadius: 20,
    backgroundColor: "#252222",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 220,
  },
  content: {
    padding: 24,
  },
  track: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  artist: {
    fontSize: 18,
    color: "#ccc",
    marginTop: 8,
    textAlign: "center",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
  },
  confirm: {
    backgroundColor: "#1DB954",
    padding: 12,
    borderRadius: 8,
    width: 100,
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
