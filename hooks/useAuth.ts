import * as AuthSession from "expo-auth-session";
import { useEffect, useRef, useState } from "react";
import { authService } from "../services/authService";
import type { AuthHookReturn } from "../types/index";

export const useAuthState = (): AuthHookReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    authService.getAuthRequest(),
    authService.getDiscovery(),
  );

  useEffect(() => {
    initAuth();
    return () => {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      handleAuthSuccess(response.params.code);
    }
  }, [response]);

  const initAuth = async (): Promise<void> => {
    const token = await authService.getValidAccessToken();
    if (token) {
      setSpotifyToken(token);
      setIsAuthenticated(true);
      scheduleTokenRefresh();
      console.log("Auth restored from storage");
    }
    setIsLoading(false);
  };

  const handleAuthSuccess = async (code: string): Promise<void> => {
    try {
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          code,
          clientId: authService.getAuthRequest().clientId,
          redirectUri: authService.getAuthRequest().redirectUri,
          extraParams: {
            code_verifier: request?.codeVerifier || "",
          },
        },
        authService.getDiscovery(),
      );

      const tokens = {
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken!,
        expiresAt: Date.now() + tokenResponse.expiresIn! * 1000,
      };

      await authService.saveTokens(tokens);
      setSpotifyToken(tokens.accessToken);
      setIsAuthenticated(true);
      scheduleTokenRefresh(tokens);
      console.log("Token exchange successful");
    } catch (error) {
      console.error("Token exchange failed:", error);
    }
  };

  const scheduleTokenRefresh = async (tokensParam?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  }) => {
    const tokens = tokensParam || (await authService.getTokens());
    if (!tokens) return;

    const now = Date.now();
    const timeoutMs = tokens.expiresAt - now - 60_000;

    if (timeoutMs <= 0) {
      await refreshAccessToken(tokens.refreshToken);
      return;
    }

    if (refreshTimeout.current) clearTimeout(refreshTimeout.current);

    refreshTimeout.current = setTimeout(async () => {
      await refreshAccessToken(tokens.refreshToken);
    }, timeoutMs);
  };

  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const refreshed = await authService.refreshToken(refreshToken);
      await authService.saveTokens(refreshed);
      setSpotifyToken(refreshed.accessToken);
      scheduleTokenRefresh(refreshed);
      console.log("Token refreshed successfully");
    } catch (error) {
      console.error("Token refresh failed:", error);
      await logout();
    }
  };

  const login = (): void => {
    promptAsync();
  };

  const logout = async (): Promise<void> => {
    if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
    await authService.clearToken();
    setSpotifyToken(null);
    setIsAuthenticated(false);
    console.log("User logged out");
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
