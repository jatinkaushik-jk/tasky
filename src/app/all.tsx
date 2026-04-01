import React, { useState } from "react";
import {
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AddTodoModal } from "@/components/add-todo-modal";
import { EmptyState } from "@/components/empty-state";
import { TodoCard } from "@/components/todo-card";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Todo } from "@/store/todos";
import { useTodosContext } from "@/store/todos-context";

type FilterType = "all" | "pending" | "done";

function groupByDate(todos: Todo[]): { title: string; data: Todo[] }[] {
  const map: Record<string, Todo[]> = {};
  for (const todo of todos) {
    const d = new Date(todo.createdAt);
    const key = d.toLocaleDateString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      year:
        d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
    if (!map[key]) map[key] = [];
    map[key].push(todo);
  }
  return Object.entries(map).map(([title, data]) => ({ title, data }));
}

export default function AllTasksScreen() {
  const theme = useTheme();
  const { todos, addTodo, updateTodo, deleteTodo, toggleDone } =
    useTodosContext();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setModalVisible(true);
  };

  const handleSave = (data: Omit<Todo, "id" | "createdAt" | "done">) => {
    if (editingTodo) {
      updateTodo(editingTodo.id, data);
    } else {
      addTodo(data);
    }
    setEditingTodo(null);
  };

  const handleClose = () => {
    setModalVisible(false);
    setEditingTodo(null);
  };

  const filtered =
    filter === "all"
      ? todos
      : filter === "pending"
        ? todos.filter((t) => !t.done)
        : todos.filter((t) => t.done);

  const sections = groupByDate(filtered);
  const totalDone = todos.filter((t) => t.done).length;

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "done", label: "Done" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            { maxWidth: MaxContentWidth, alignSelf: "center", width: "100%" },
          ]}
        >
          <View>
            <Text style={[styles.brand, { color: theme.accent }]}>Tasky</Text>
            <Text style={[styles.tabTitle, { color: theme.text }]}>
              All Tasks
            </Text>
          </View>
          <View style={styles.headerRight}>
            {todos.length > 0 && (
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: theme.successSoft },
                ]}
              >
                <Text style={[styles.statNum, { color: theme.success }]}>
                  {totalDone}
                </Text>
                <Text style={[styles.statLabel, { color: theme.success }]}>
                  done
                </Text>
              </View>
            )}
            {todos.length > 0 && (
              <View
                style={[styles.statCard, { backgroundColor: theme.accentSoft }]}
              >
                <Text style={[styles.statNum, { color: theme.accentText }]}>
                  {todos.length - totalDone}
                </Text>
                <Text style={[styles.statLabel, { color: theme.accentText }]}>
                  left
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Filter chips */}
        {todos.length > 0 && (
          <View
            style={[
              styles.filterRow,
              { maxWidth: MaxContentWidth, alignSelf: "center", width: "100%" },
            ]}
          >
            {filterOptions.map((opt) => (
              <Pressable
                key={opt.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      filter === opt.key
                        ? theme.accent
                        : theme.backgroundElement,
                  },
                ]}
                onPress={() => setFilter(opt.key)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: filter === opt.key ? "#fff" : theme.textSecondary,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Sectioned task list */}
        {filtered.length === 0 ? (
          <EmptyState isToday={false} />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TodoCard
                todo={item}
                onToggle={toggleDone}
                onEdit={handleEdit}
                onDelete={deleteTodo}
              />
            )}
            renderSectionHeader={({ section: { title } }) => (
              <View
                style={[
                  styles.sectionHeader,
                  { backgroundColor: theme.background },
                ]}
              >
                <Text
                  style={[styles.sectionTitle, { color: theme.textSecondary }]}
                >
                  {title}
                </Text>
                <View
                  style={[
                    styles.sectionDivider,
                    { backgroundColor: theme.border },
                  ]}
                />
              </View>
            )}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: BottomTabInset + Spacing.six },
            ]}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
          />
        )}

        {/* FAB */}
        <Pressable
          style={[styles.fab, { backgroundColor: theme.accent }]}
          onPress={() => {
            setEditingTodo(null);
            setModalVisible(true);
          }}
          android_ripple={{ color: "rgba(255,255,255,0.3)", borderless: true }}
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      </SafeAreaView>

      <AddTodoModal
        visible={modalVisible}
        editTodo={editingTodo}
        onSave={handleSave}
        onClose={handleClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  brand: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  tabTitle: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.two,
    paddingBottom: Spacing.one,
  },
  statCard: {
    borderRadius: 12,
    paddingHorizontal: Spacing.two + 2,
    paddingVertical: Spacing.one,
    alignItems: "center",
    minWidth: 44,
  },
  statNum: {
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 22,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  filterChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
    flexGrow: 1,
    maxWidth: MaxContentWidth,
    alignSelf: "center",
    width: "100%",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.one,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    flexShrink: 0,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
  },
  fab: {
    position: "absolute",
    bottom: BottomTabInset + Spacing.four,
    right: Spacing.four,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#7C5CFC",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  fabText: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "300",
    lineHeight: 36,
    marginTop: -2,
  },
});
