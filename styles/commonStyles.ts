import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  screenRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenSafeArea: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: colors.surface,
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    width: "85%",
    maxWidth: 400,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 30,
    textAlign: "center",
  },
});
