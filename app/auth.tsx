import { LoginCard } from "@/components/auth/LoginCard";
import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { useAuth } from "@/context/AuthContext";
import { commonStyles } from "@/styles/commonStyles";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthScreen() {
  const { login, canLogin } = useAuth();

  return (
    <View style={commonStyles.screenRoot}>
      <ScreenBackground />
      <SafeAreaView style={commonStyles.screenSafeArea}>
        <LoginCard onLogin={login} disabled={!canLogin} />
      </SafeAreaView>
    </View>
  );
}
