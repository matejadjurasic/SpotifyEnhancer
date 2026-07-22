import { Audio } from "expo-av";

let currentSound: Audio.Sound | null = null;
let currentId: string | null = null;

export const mapAudioService = {
  async play(id: string, url: string): Promise<void> {
    await mapAudioService.stop();
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync({ uri: url });
    currentSound = sound;
    currentId = id;
    await sound.playAsync();
  },

  async stop(): Promise<void> {
    if (currentSound) {
      await currentSound.stopAsync().catch(() => {});
      await currentSound.unloadAsync().catch(() => {});
      currentSound = null;
      currentId = null;
    }
  },

  getCurrentId(): string | null {
    return currentId;
  },
};
