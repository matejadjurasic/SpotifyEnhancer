import * as SecureStore from 'expo-secure-store';

export const secureStorage = {
  async save(key: string, value: string): Promise<boolean> {
    try {
      await SecureStore.setItemAsync(key, value);
      return true;
    } catch (error) {
      console.error('Error saving to secure storage:', error);
      return false;
    }
  },

  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error reading from secure storage:', error);
      return null;
    }
  },

  async remove(key: string): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error('Error removing from secure storage:', error);
      return false;
    }
  },
};