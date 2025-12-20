import { LoginCard } from '@/components/auth/LoginCard';
import { useAuth } from '@/context/AuthContext';
import { commonStyles } from '@/styles/commonStyles';
import { secureStorage } from '@/utils/storage';
import React from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

export default function AuthScreen() {
  const { login, canLogin, isAuthenticated } = useAuth();

  const checkStorage = async () => {
    const token = await secureStorage.get('spotify_token');
    Alert.alert('Token in storage', token ? 'EXISTS' : 'DOES NOT EXIST');
    console.log('Token:', token);
  };

  return (
    <View style={commonStyles.container}>
      <LoginCard onLogin={login} disabled={!canLogin} />
      <TouchableOpacity onPress={checkStorage} style={{ marginTop: 20 }}>
        <Text style={{ color: '#fff' }}>Check Storage</Text>
      </TouchableOpacity>
      <Text style={{ color: '#fff', marginTop: 10 }}>
        Auth Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </Text>
    </View>
  );
}