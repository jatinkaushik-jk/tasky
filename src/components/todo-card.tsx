import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { formatDeadline, isOverdue, Todo } from "@/store/todos";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface TodoCardProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export function TodoCard({ todo, onToggle, onEdit, onDelete }: TodoCardProps) {
  const theme = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle(todo.id);
  };

  const overdue =
    todo.deadlineEnabled &&
    todo.deadline &&
    !todo.done &&
    isOverdue(todo.deadline);

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: theme.surface,
            borderColor: overdue ? theme.deadline : theme.border,
            opacity: pressed ? 0.92 : 1,
          },
          todo.done && { opacity: 0.6 },
        ]}
        onLongPress={() => onEdit(todo)}
        android_ripple={{ color: theme.accentSoft }}
      >
        {/* Left: Checkbox */}
        <Pressable
          style={[
            styles.checkbox,
            {
              borderColor: todo.done ? theme.accent : theme.checkboxBorder,
              backgroundColor: todo.done ? theme.accent : "transparent",
            },
          ]}
          onPress={handleToggle}
          hitSlop={8}
        >
          {todo.done && <Text style={styles.checkmark}>✓</Text>}
        </Pressable>

        {/* Main content */}
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              { color: theme.text },
              todo.done && styles.titleDone,
            ]}
            numberOfLines={1}
          >
            {todo.title}
          </Text>

          {todo.description ? (
            <Text
              style={[styles.description, { color: theme.textSecondary }]}
              numberOfLines={2}
            >
              {todo.description}
            </Text>
          ) : null}

          {/* Badges row */}
          <View style={styles.badgesRow}>
            {todo.deadlineEnabled && todo.deadline ? (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: overdue
                      ? theme.deadlineSoft
                      : theme.accentSoft,
                  },
                ]}
              >
                <Text style={[styles.badgeIcon]}>🗓</Text>
                <Text
                  style={[
                    styles.badgeText,
                    { color: overdue ? theme.deadline : theme.accentText },
                  ]}
                >
                  {formatDeadline(todo.deadline)}
                </Text>
              </View>
            ) : null}

            {todo.reminderTime ? (
              <View
                style={[styles.badge, { backgroundColor: theme.warningSoft }]}
              >
                <Text style={styles.badgeIcon}>🔔</Text>
                <Text style={[styles.badgeText, { color: theme.warning }]}>
                  {new Date(todo.reminderTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            ) : null}

            {todo.done && (
              <View
                style={[styles.badge, { backgroundColor: theme.successSoft }]}
              >
                <Text style={[styles.badgeText, { color: theme.success }]}>
                  ✓ Done
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.iconBtn, { backgroundColor: theme.successSoft }]}
            onPress={() => onEdit(todo)}
            hitSlop={4}
          >
            <Ionicons name="create-outline" size={20} color="green" />
          </Pressable>
          <Pressable
            style={[styles.iconBtn, { backgroundColor: theme.deadlineSoft }]}
            onPress={() => onDelete(todo.id)}
            hitSlop={4}
          >
            <Ionicons name="trash-outline" size={20} color="red" />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 16,
    borderWidth: 1.5,
    padding: Spacing.three,
    gap: Spacing.two + 4,
    marginBottom: Spacing.two + 4,
    ...Platform.select({
      ios: {
        shadowColor: "#7C5CFC",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    flexShrink: 0,
  },
  checkmark: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 16,
  },
  content: {
    flex: 1,
    gap: Spacing.one,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  titleDone: {
    textDecorationLine: "line-through",
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeIcon: {
    fontSize: 11,
    lineHeight: 14,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 14,
  },
  actions: {
    flexDirection: "column",
    gap: Spacing.one,
    flexShrink: 0,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnText: {
    fontSize: 14,
    lineHeight: 18,
  },
});
