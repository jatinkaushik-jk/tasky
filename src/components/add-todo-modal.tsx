import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Todo } from "@/store/todos";

interface AddTodoModalProps {
  visible: boolean;
  editTodo?: Todo | null;
  onSave: (data: Omit<Todo, "id" | "createdAt" | "done">) => void;
  onClose: () => void;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toTimeString(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toDateString(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Simple inline date picker row
function SimpleDatePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Date;
  onChange: (d: Date) => void;
}) {
  const theme = useTheme();
  const [dateStr, setDateStr] = useState(toDateString(value));
  const [timeStr, setTimeStr] = useState(toTimeString(value));

  const handleDateChange = (text: string) => {
    setDateStr(text);
    const parts = text.split("-");
    if (parts.length === 3) {
      const y = parseInt(parts[0]);
      const m = parseInt(parts[1]) - 1;
      const d = parseInt(parts[2]);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        const next = new Date(value);
        next.setFullYear(y, m, d);
        onChange(next);
      }
    }
  };

  const handleTimeChange = (text: string) => {
    setTimeStr(text);
    const parts = text.split(":");
    if (parts.length === 2) {
      const h = parseInt(parts[0]);
      const min = parseInt(parts[1]);
      if (!isNaN(h) && !isNaN(min)) {
        const next = new Date(value);
        next.setHours(h, min, 0, 0);
        onChange(next);
      }
    }
  };

  return (
    <View style={pickerStyles.row}>
      <Text style={[pickerStyles.label, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <TextInput
        style={[
          pickerStyles.input,
          {
            backgroundColor: theme.backgroundElement,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        value={dateStr}
        onChangeText={handleDateChange}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={theme.textSecondary}
        keyboardType="numeric"
      />
      <TextInput
        style={[
          pickerStyles.input,
          pickerStyles.timeInput,
          {
            backgroundColor: theme.backgroundElement,
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        value={timeStr}
        onChangeText={handleTimeChange}
        placeholder="HH:MM"
        placeholderTextColor={theme.textSecondary}
        keyboardType="numeric"
      />
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    width: 68,
    flexShrink: 0,
  },
  input: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.one + 2,
    fontSize: 14,
    fontWeight: "500",
  },
  timeInput: {
    flex: 0,
    width: 76,
  },
});

export function AddTodoModal({
  visible,
  editTodo,
  onSave,
  onClose,
}: AddTodoModalProps) {
  const theme = useTheme();
  const slideAnim = useRef(new Animated.Value(600)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadlineEnabled, setDeadlineEnabled] = useState(false);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000),
  );
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000 - 15 * 60 * 1000),
  );

  // Populate form when editing
  useEffect(() => {
    if (visible) {
      if (editTodo) {
        setTitle(editTodo.title);
        setDescription(editTodo.description ?? "");
        setDeadlineEnabled(editTodo.deadlineEnabled);
        setDeadline(
          editTodo.deadline
            ? new Date(editTodo.deadline)
            : new Date(Date.now() + 24 * 60 * 60 * 1000),
        );
        setReminderEnabled(!!editTodo.reminderTime);
        setReminderTime(
          editTodo.reminderTime
            ? new Date(editTodo.reminderTime)
            : new Date(Date.now() + 24 * 60 * 60 * 1000 - 15 * 60 * 1000),
        );
      } else {
        setTitle("");
        setDescription("");
        setDeadlineEnabled(false);
        setDeadline(new Date(Date.now() + 24 * 60 * 60 * 1000));
        setReminderEnabled(false);
        setReminderTime(
          new Date(Date.now() + 24 * 60 * 60 * 1000 - 15 * 60 * 1000),
        );
      }
      // Animate in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 250,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 600,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, editTodo]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      deadlineEnabled,
      deadline: deadlineEnabled ? deadline.toISOString() : undefined,
      reminderTime: reminderEnabled ? reminderTime.toISOString() : undefined,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: theme.overlay,
              opacity: backdropAnim,
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.kvAvoid}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.surface,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar}>
            <View
              style={[styles.handle, { backgroundColor: theme.borderStrong }]}
            />
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                {editTodo ? "Edit Task" : "New Task"}
              </Text>
              <Pressable
                style={[
                  styles.closeBtn,
                  { backgroundColor: theme.backgroundElement },
                ]}
                onPress={onClose}
              >
                <Text
                  style={[styles.closeBtnText, { color: theme.textSecondary }]}
                >
                  ✕
                </Text>
              </Pressable>
            </View>

            {/* Title */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Task title <Text style={{ color: theme.deadline }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.titleInput,
                  {
                    backgroundColor: theme.backgroundElement,
                    color: theme.text,
                    borderColor: title.trim() ? theme.accent : theme.border,
                  },
                ]}
                placeholder="What needs to be done?"
                placeholderTextColor={theme.textSecondary}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
                autoFocus
                returnKeyType="next"
              />
            </View>

            {/* Description */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
                Description{" "}
                <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                  (optional)
                </Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.descriptionInput,
                  {
                    backgroundColor: theme.backgroundElement,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Add more details..."
                placeholderTextColor={theme.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={500}
                textAlignVertical="top"
                returnKeyType="done"
                blurOnSubmit
              />
            </View>

            {/* Deadline */}
            <View style={[styles.toggleRow, { borderColor: theme.border }]}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleIcon}>🗓</Text>
                <View>
                  <Text style={[styles.toggleLabel, { color: theme.text }]}>
                    Deadline
                  </Text>
                  <Text
                    style={[styles.toggleSub, { color: theme.textSecondary }]}
                  >
                    Set a due date & time
                  </Text>
                </View>
              </View>
              <Switch
                value={deadlineEnabled}
                onValueChange={setDeadlineEnabled}
                trackColor={{ false: theme.border, true: theme.accent }}
                thumbColor="#fff"
                ios_backgroundColor={theme.border}
              />
            </View>

            {deadlineEnabled && (
              <View
                style={[
                  styles.subSection,
                  { backgroundColor: theme.accentSoft },
                ]}
              >
                <SimpleDatePicker
                  label="Date"
                  value={deadline}
                  onChange={setDeadline}
                />
              </View>
            )}

            {/* Reminder */}
            <View style={[styles.toggleRow, { borderColor: theme.border }]}>
              <View style={styles.toggleInfo}>
                <Text style={styles.toggleIcon}>🔔</Text>
                <View>
                  <Text style={[styles.toggleLabel, { color: theme.text }]}>
                    Reminder
                  </Text>
                  <Text
                    style={[styles.toggleSub, { color: theme.textSecondary }]}
                  >
                    Get a reminder at a specific time
                  </Text>
                </View>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{ false: theme.border, true: theme.warning }}
                thumbColor="#fff"
                ios_backgroundColor={theme.border}
              />
            </View>

            {reminderEnabled && (
              <View
                style={[
                  styles.subSection,
                  { backgroundColor: theme.warningSoft },
                ]}
              >
                <SimpleDatePicker
                  label="Reminder"
                  value={reminderTime}
                  onChange={setReminderTime}
                />
              </View>
            )}

            {/* Action buttons */}
            <View style={styles.actions}>
              <Pressable
                style={[
                  styles.cancelBtn,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.backgroundElement,
                  },
                ]}
                onPress={onClose}
              >
                <Text
                  style={[styles.cancelBtnText, { color: theme.textSecondary }]}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: title.trim()
                      ? theme.accent
                      : theme.borderStrong,
                  },
                ]}
                onPress={handleSave}
                disabled={!title.trim()}
              >
                <Text style={styles.saveBtnText}>
                  {editTodo ? "Save Changes" : "Add Task"}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  kvAvoid: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  handleBar: {
    alignItems: "center",
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Platform.select({ ios: 40 }) ?? Spacing.four,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.one,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  fieldGroup: {
    gap: Spacing.one,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  input: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    fontSize: 16,
    fontWeight: "500",
  },
  titleInput: {
    fontSize: 16,
  },
  descriptionInput: {
    minHeight: 80,
    paddingTop: Spacing.two + 2,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two + 2,
  },
  toggleIcon: {
    fontSize: 20,
    lineHeight: 26,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  toggleSub: {
    fontSize: 12,
    marginTop: 1,
  },
  subSection: {
    borderRadius: 12,
    padding: Spacing.three,
    marginTop: -Spacing.two,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.two + 4,
    marginTop: Spacing.two,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: Spacing.two + 6,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  saveBtn: {
    flex: 2,
    borderRadius: 14,
    paddingVertical: Spacing.two + 6,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
});
