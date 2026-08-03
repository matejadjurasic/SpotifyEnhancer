import { colors } from "@/styles/colors";
import type { AssistantAction, AssistantResponse } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  visible: boolean;
  data: AssistantResponse;
  onClose: () => void;
}

function summaryIcon(data: AssistantResponse) {
  if (data.failed_actions === 0) {
    return (
      <Ionicons name="checkmark-circle" size={26} color={colors.primary} />
    );
  }
  if (data.successful_actions === 0) {
    return <Ionicons name="close-circle" size={26} color={colors.danger} />;
  }
  return <Ionicons name="warning" size={26} color="#f59e0b" />;
}

function ActionRow({ action }: { action: AssistantAction }) {
  const ok = action.status === "SUCCESS";
  return (
    <View style={styles.actionRow}>
      <Ionicons
        name={ok ? "checkmark-circle" : "close-circle"}
        size={18}
        color={ok ? colors.primary : colors.danger}
        style={styles.actionIcon}
      />
      <View style={styles.actionText}>
        <Text style={styles.actionType}>{action.action_type}</Text>
        <Text style={styles.actionTarget} numberOfLines={1}>
          {action.target}
        </Text>
        <Text style={[styles.actionDetails, !ok && styles.actionDetailsFailed]}>
          {action.details}
        </Text>
      </View>
    </View>
  );
}

export function AssistantResultModal({ visible, data, onClose }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Message row */}
          <View style={styles.messageRow}>
            {summaryIcon(data)}
            <Text style={styles.messageText}>{data.message}</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <Text style={styles.statItem}>
              <Text style={styles.statNum}>{data.requested_actions}</Text>
              {"  requested"}
            </Text>
            <Text style={[styles.statItem, styles.statSuccess]}>
              <Text style={styles.statNum}>{data.successful_actions}</Text>
              {"  done"}
            </Text>
            {data.failed_actions > 0 && (
              <Text style={[styles.statItem, styles.statFail]}>
                <Text style={styles.statNum}>{data.failed_actions}</Text>
                {"  failed"}
              </Text>
            )}
          </View>

          {/* Expand toggle */}
          {data.actions?.length > 0 && (
            <TouchableOpacity
              style={styles.expandToggle}
              onPress={() => setExpanded((v) => !v)}
              accessibilityRole="button"
            >
              <Text style={styles.expandToggleText}>
                {expanded ? "Hide details" : "Show details"}
              </Text>
              <Ionicons
                name={expanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}

          {/* Actions list */}
          {expanded && (
            <ScrollView
              style={styles.actionsList}
              showsVerticalScrollIndicator={false}
            >
              {data.actions.map((action, i) => (
                <ActionRow key={i} action={action} />
              ))}
            </ScrollView>
          )}

          {/* OK button */}
          <TouchableOpacity
            style={styles.okButton}
            onPress={onClose}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Text style={styles.okText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  card: {
    width: "88%",
    maxWidth: 420,
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(29,185,84,0.2)",
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  messageText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
  },
  statItem: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  statNum: {
    fontWeight: "700",
    fontSize: 13,
    color: colors.text,
  },
  statSuccess: {
    color: colors.primary,
  },
  statFail: {
    color: colors.danger,
  },
  expandToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  expandToggleText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },
  actionsList: {
    maxHeight: 220,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  actionIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
  actionText: {
    flex: 1,
    gap: 2,
  },
  actionType: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  actionTarget: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  actionDetails: {
    fontSize: 12,
    color: colors.primary,
  },
  actionDetailsFailed: {
    color: colors.danger,
  },
  okButton: {
    marginTop: 18,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  okText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    letterSpacing: 1,
  },
});
