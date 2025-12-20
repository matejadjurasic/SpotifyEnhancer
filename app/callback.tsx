import { commonStyles } from '@/styles/commonStyles';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function CallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    // AuthSession will handle the token extraction
    console.log('📞 Callback params:', params);
    
    // Wait a moment for AuthSession to process
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 500);
  };

  return (
    <View style={commonStyles.container}>
      <ActivityIndicator size="large" color="#1DB954" />
    </View>
  );
}