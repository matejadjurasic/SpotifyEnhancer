import { ScreenBackground } from "@/components/ui/ScreenBackground";
import { useAuth } from "@/context/AuthContext";
import { uploadService } from "@/services/uploadService";
import { colors } from "@/styles/colors";
import { commonStyles } from "@/styles/commonStyles";
import type { ProfileExecution, ProfileResponse } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ExecutionRow({
  item,
  index,
}: {
  item: ProfileExecution;
  index: number;
}) {
  return (
    <View style={styles.executionCard}>
      <View style={styles.executionHeader}>
        <Text style={styles.executionIndex}>#{index + 1}</Text>
        <Text style={styles.executionWorkflow}>{item.workflow_name}</Text>
        <Text style={styles.executionCost}>
          ${(item.total_cost ?? 0).toFixed(3)}
        </Text>
      </View>
      <Text style={styles.executionDate}>{formatDate(item.created_at)}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { spotifyToken } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const data = await uploadService.getProfile(
          spotifyToken!,
          controller.signal,
        );
        setProfile(data);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          Alert.alert(
            "Error",
            (err as Error).message ?? "Failed to load profile.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();
    return () => controller.abort();
  }, [spotifyToken]);

  return (
    <View style={commonStyles.screenRoot}>
      <ScreenBackground />
      <SafeAreaView style={commonStyles.screenSafeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PROFILE</Text>
          <View style={styles.backButtonPlaceholder} />
        </View>

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : profile ? (
          <>
            {/* Name + Balance row */}
            <View style={styles.profileRow}>
              <View style={styles.avatarWrap}>
                <Ionicons name="person" size={28} color={colors.text} />
              </View>
              <Text style={styles.nameText} numberOfLines={1}>
                {profile.name}
              </Text>
              <View style={styles.balanceBadge}>
                <Text style={styles.balanceLabel}>Balance</Text>
                <Text style={styles.balanceValue}>
                  ${profile.balance.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Executions list */}
            <Text style={styles.sectionTitle}>EXECUTIONS</Text>
            <FlatList
              data={profile.executions}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item, index }) => (
                <ExecutionRow item={item} index={index} />
              )}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No executions yet.</Text>
              }
            />
          </>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
    marginBottom: 28,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(29,185,84,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonPlaceholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(29,185,84,0.18)",
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  nameText: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.3,
  },
  balanceBadge: {
    alignItems: "flex-end",
    flexShrink: 0,
  },
  balanceLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.3,
  },
  sectionTitle: {
    alignSelf: "flex-start",
    fontSize: 11,
    color: colors.primary,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  list: {
    alignSelf: "stretch",
    flex: 1,
  },
  executionCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(29,185,84,0.15)",
    padding: 14,
    marginBottom: 10,
  },
  executionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  executionIndex: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    minWidth: 24,
  },
  executionWorkflow: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  executionCost: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  executionDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 32,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 32,
    fontSize: 14,
  },
});
