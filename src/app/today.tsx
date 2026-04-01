import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AddTodoModal } from '@/components/add-todo-modal';
import { EmptyState } from '@/components/empty-state';
import { TodoCard } from '@/components/todo-card';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Todo } from '@/store/todos';
import { useTodosContext } from '@/store/todos-context';

export default function TodayScreen() {
  const theme = useTheme();
  const { todayTodos, addTodo, updateTodo, deleteTodo, toggleDone } = useTodosContext();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setModalVisible(true);
  };

  const handleSave = (data: Omit<Todo, 'id' | 'createdAt' | 'done'>) => {
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

  const pending = todayTodos.filter((t) => !t.done);
  const done = todayTodos.filter((t) => t.done);

  const today = new Date();
  const dateLabel = today.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' }]}>
          <View>
            <Text style={[styles.brand, { color: theme.accent }]}>Tasky</Text>
            <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>{dateLabel}</Text>
            <Text style={[styles.tabTitle, { color: theme.text }]}>Today</Text>
          </View>
          <View style={styles.headerRight}>
            {todayTodos.length > 0 && (
              <View style={[styles.countBadge, { backgroundColor: theme.accentSoft }]}>
                <Text style={[styles.countText, { color: theme.accentText }]}>
                  {pending.length}/{todayTodos.length}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Progress bar */}
        {todayTodos.length > 0 && (
          <View style={[styles.progressContainer, { maxWidth: MaxContentWidth, alignSelf: 'center', width: '100%' }]}>
            <View style={[styles.progressTrack, { backgroundColor: theme.accentSoft }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.accent,
                    width: `${(done.length / todayTodos.length) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
              {done.length} of {todayTodos.length} done
            </Text>
          </View>
        )}

        {/* Task List */}
        <FlatList
          data={[...pending, ...done]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TodoCard
              todo={item}
              onToggle={toggleDone}
              onEdit={handleEdit}
              onDelete={deleteTodo}
            />
          )}
          ListEmptyComponent={<EmptyState isToday />}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: BottomTabInset + Spacing.six },
          ]}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />

        {/* FAB */}
        <Pressable
          style={[styles.fab, { backgroundColor: theme.accent }]}
          onPress={() => { setEditingTodo(null); setModalVisible(true); }}
          android_ripple={{ color: 'rgba(255,255,255,0.3)', borderless: true }}
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  brand: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  tabTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: Spacing.one,
    paddingBottom: Spacing.one,
  },
  countBadge: {
    paddingHorizontal: Spacing.two + 4,
    paddingVertical: Spacing.one,
    borderRadius: 20,
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressContainer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    gap: Spacing.one,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    flexGrow: 1,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  fab: {
    position: 'absolute',
    bottom: BottomTabInset + Spacing.four,
    right: Spacing.four,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#7C5CFC',
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
    color: '#fff',
    fontWeight: '300',
    lineHeight: 36,
    marginTop: -2,
  },
});
