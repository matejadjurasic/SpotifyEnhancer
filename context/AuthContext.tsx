import React, { createContext, ReactNode, useContext } from "react";
import { useAuthState } from "../hooks/useAuth";
import type { AuthHookReturn } from "../types/index";

const AuthContext = createContext<AuthHookReturn | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuthState();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthHookReturn => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
