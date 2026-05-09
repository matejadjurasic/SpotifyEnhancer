import { colors } from "@/styles/colors";
import { commonStyles } from "@/styles/commonStyles";
import { ActivityIndicator, View } from "react-native";

export default function CallbackScreen() {
  return (
    <View style={commonStyles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
