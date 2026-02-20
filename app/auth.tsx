import { LoginCard } from "@/components/auth/LoginCard";
import { useAuth } from "@/context/AuthContext";
import { commonStyles } from "@/styles/commonStyles";
import React from "react";
import { View } from "react-native";

export default function AuthScreen() {
  const { login, canLogin } = useAuth();

  return (
    <View style={commonStyles.container}>
      <LoginCard onLogin={login} disabled={!canLogin} />
    </View>
  );
}
