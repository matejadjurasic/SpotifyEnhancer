import * as AuthSession from 'expo-auth-session';
import { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import type { AuthHookReturn } from '../types/index';

export const useAuth = (): AuthHookReturn => {
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
      handleAuthSuccess(response.params.access_token);
    }
  }, [response]);

  const checkAuth = async (): Promise<void> => {
    const token = await authService.getToken();
    if (token) {
      setSpotifyToken(token);
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  };

  const handleAuthSuccess = async (token: string): Promise<void> => {
    const saved = await authService.saveToken(token);
    if (saved) {
      setSpotifyToken(token);
      setIsAuthenticated(true);
    }
  };

  const login = (): void => {
    promptAsync();
  };

  const logout = async (): Promise<void> => {
    await authService.clearToken();
    setSpotifyToken(null);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    spotifyToken,
    isLoading,
    canLogin: !!request,
    login,
    logout,
  };
};