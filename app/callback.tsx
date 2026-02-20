import { commonStyles } from "@/styles/commonStyles";
import { ActivityIndicator, View } from "react-native";

export default function CallbackScreen() {
  return (
    <View style={commonStyles.container}>
      <ActivityIndicator size="large" color="#1DB954" />
    </View>
  );
}
