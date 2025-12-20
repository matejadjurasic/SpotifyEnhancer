import * as AuthSession from 'expo-auth-session';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  spotifyToken: string | null;
  isLoading: boolean;
  canLogin: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    authService.getAuthRequest(),
    authService.getDiscovery()
  );

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      handleAuthSuccess(response.params.code);
    }
  }, [response]);

  const checkAuth = async (): Promise<void> => {
    console.log('🔍 Checking auth...');
    const token = await authService.getToken();
    console.log('🎫 Token found:', token ? 'YES' : 'NO');
    if (token) {
      setSpotifyToken(token);
      setIsAuthenticated(true);
      console.log('✅ User authenticated');
    }else{
        console.log('❌ No token, user not authenticated');
    };
    setIsLoading(false);
  };

  const handleAuthSuccess = async (code: string): Promise<void> => {
     console.log('🎉 Got authorization code, exchanging for token...');
    
    try {
      // Exchange code for token
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          code,
          clientId: authService.getAuthRequest().clientId,
          redirectUri: authService.getAuthRequest().redirectUri,
          extraParams: {
            code_verifier: request?.codeVerifier || '',
          },
        },
        authService.getDiscovery()
      );
      console.log('🎫 Got access token!');
      const saved = await authService.saveToken(tokenResponse.accessToken);
      if (saved) {
        setSpotifyToken(tokenResponse.accessToken);
        setIsAuthenticated(true);
        console.log('✅ Token saved, user authenticated');
      } else {
        console.log('❌ Failed to save token');
      }
    } catch (error) {
      console.error('❌ Token exchange failed:', error);
    }
  };

  const login = async (): Promise<void> => {
    console.log('🎵 Login clicked!');
    console.log('📝 Request object:', request);
    console.log('🔗 Redirect URI:', authService.getAuthRequest().redirectUri);
    
    try {
        const result = await promptAsync();
        console.log('🎯 Prompt result:', result);
    } catch (error) {
        console.error('❌ Login error:', error);
    }
  };

  const logout = async (): Promise<void> => {
    await authService.clearToken();
    setSpotifyToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        spotifyToken,
        isLoading,
        canLogin: !!request,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};