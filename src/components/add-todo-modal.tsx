import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
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
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTheme } from "@/hooks/use-theme";
import { Todo } from "@/store/todos";

interface AddTodoModalProps {
  visible: boolean;
  editTodo?: Todo | null;
  onSave: (data: Omit<Todo, "id" | "createdAt" | "done">) => void;
  onClose: () => void;
}


/** Format date as "Mon DD, YYYY" */
function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Format time in 12-hr AM/PM */
function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}



/**
 * Native date/time picker using @react-native-community/datetimepicker.
 * - Date: calendar UI
 * - Time: clock UI in 12-hr AM/PM
 * On Android pickers are shown as dialogs; on iOS inline spinners.
 */
function NativeDatePicker({
  label,
  value,
  onChange,
  accentColor,
}: {
  label: string;
  value: Date;
  onChange: (d: Date) => void;
  accentColor?: string;
}) {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const handleDateChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") {
      setShowDate(false);
      if (selected) {
        // After date chosen on Android, open time picker
        onChange(selected);
        setShowTime(true);
      }
    } else {
      if (selected) onChange(selected);
    }
  };

  const handleTimeChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") {
      setShowTime(false);
    }
    if (selected) onChange(selected);
  };

  const accent = accentColor ?? theme.accent;

  return (
    <View style={pickerStyles.container}>
      <Text style={[pickerStyles.sectionLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>

      <View style={pickerStyles.btnRow}>
        {/* Date button */}
        <Pressable
          style={[pickerStyles.chipBtn, { backgroundColor: theme.backgroundElement, borderColor: accent }]}
          onPress={() => setShowDate(true)}
        >
          <Text style={pickerStyles.chipIcon}>📅</Text>
          <Text style={[pickerStyles.chipText, { color: theme.text }]}>
            {formatDate(value)}
          </Text>
        </Pressable>

        {/* Time button */}
        <Pressable
          style={[pickerStyles.chipBtn, { backgroundColor: theme.backgroundElement, borderColor: accent }]}
          onPress={() => setShowTime(true)}
        >
          <Text style={pickerStyles.chipIcon}>🕐</Text>
          <Text style={[pickerStyles.chipText, { color: theme.text }]}>
            {formatTime(value)}
          </Text>
        </Pressable>
      </View>

      {/* Date picker */}
      {showDate && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "calendar"}
          onChange={handleDateChange}
          minimumDate={new Date()}
          accentColor={accent}
          themeVariant={isDark ? "dark" : "light"}
        />
      )}

      {/* Time picker */}
      {showTime && (
        <DateTimePicker
          value={value}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "clock"}
          is24Hour={false}
          onChange={handleTimeChange}
          accentColor={accent}
          themeVariant={isDark ? "dark" : "light"}
        />
      )}
    </View>
  );
}

const pickerStyles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  btnRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  chipBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one + 4,
  },
  chipIcon: {
    fontSize: 15,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
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
                <NativeDatePicker
                  label="Deadline"
                  value={deadline}
                  onChange={setDeadline}
                  accentColor={theme.accent}
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
                <NativeDatePicker
                  label="Reminder"
                  value={reminderTime}
                  onChange={setReminderTime}
                  accentColor={theme.warning}
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
