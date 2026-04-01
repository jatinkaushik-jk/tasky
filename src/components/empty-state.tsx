import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface EmptyStateProps {
  isToday?: boolean;
}

export function EmptyState({ isToday }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{isToday ? '☀️' : '📋'}</Text>
      <Text style={[styles.title, { color: theme.text }]}>
        {isToday ? 'No tasks for today!' : 'No tasks yet!'}
      </Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        {isToday
          ? "You're all caught up. Tap + to add a task for today."
          : 'Start building your task list. Tap + to create your first task.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.six,
    gap: Spacing.two,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
