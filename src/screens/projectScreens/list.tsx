import React, { useState } from 'react';
import { View, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { AppText } from '../../components';
import Screen from '../../components/common/ScreenWapper';
import { useTheme } from '../../theme/ThemeProvider';
import { WorkItemIcon } from '../../components/common/getWorkItemIcon';

// Expanded static task data to demonstrate vertical scrolling
const STATIC_TASKS = [
  {
    id: '1',
    title: 'Task2',
    key: 'WORK-2',
    status: 'To Do',
    type: 'task',
  },
  {
    id: '2',
    title: 'Task1',
    key: 'WORK-1',
    status: 'In Progress',
    type: 'task',
  },
  {
    id: '3',
    title: 'Fix Authentication Flow',
    key: 'WORK-3',
    status: 'In Progress',
    type: 'bug',
  },
  {
    id: '4',
    title: 'Design System Guidelines',
    key: 'WORK-4',
    status: 'To Do',
    type: 'task',
  },
  {
    id: '5',
    title: 'API Integration for Work Items',
    key: 'WORK-5',
    status: 'In Review',
    type: 'story',
  },
  {
    id: '6',
    title: 'Update Navigation Bar Icons',
    key: 'WORK-6',
    status: 'Done',
    type: 'task',
  },
  {
    id: '7',
    title: 'Database Schema Optimization',
    key: 'WORK-7',
    status: 'To Do',
    type: 'task',
  },
  {
    id: '8',
    title: 'Setup Push Notifications',
    key: 'WORK-8',
    status: 'In Progress',
    type: 'story',
  },
];

const List = () => {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tasks locally by title or key
  const filteredTasks = STATIC_TASKS.filter(
    task =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.key.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <View className='flex-1 px-4 pt-3'>
        {/* ================= SEARCH BAR ================= */}
        <View
          className='mb-4 flex-row items-center rounded-2xl border px-3.5 py-2.5'
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
          }}
        >
          <View className='mr-2.5'>
            <AppText color={colors.textSecondary}>🔍</AppText>
          </View>
          <TextInput
            placeholder='Search work items'
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className='flex-1 p-0 text-base'
            style={{ color: colors.text }}
          />
        </View>

        {/* ================= RESULT COUNT ================= */}
        <View className='mb-3'>
          <AppText
            variant='caption'
            className='font-medium'
            color={colors.textSecondary}
          >
            {filteredTasks.length} results
          </AppText>
        </View>

        {/* ================= SCROLLABLE TASK LIST CONTAINER ================= */}
        {filteredTasks.length > 0 ? (
          <View
            className='flex-1 overflow-hidden rounded-3xl border'
            style={{
              backgroundColor: colors.background,
              borderColor: colors.border,
            }}
          >
            <FlatList
              data={filteredTasks}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16 }}
              ItemSeparatorComponent={() => (
                <View
                  className='my-1 ml-12 h-[1px]'
                  style={{ backgroundColor: colors.border }}
                />
              )}
              renderItem={({ item }) => {
                const isInProgress = item.status === 'In Progress';
                const isDone = item.status === 'Done';

                // Determine badge background and text colors
                const getBadgeStyle = () => {
                  if (isInProgress) {
                    return {
                      bg: colors.primary,
                      text: colors.white,
                    };
                  }
                  if (isDone) {
                    return {
                      bg: colors.accentOrange || colors.primary,
                      text: colors.white,
                    };
                  }
                  return {
                    bg: colors.surface,
                    text: colors.textSecondary,
                  };
                };

                const badgeStyle = getBadgeStyle();

                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className='flex-row items-start p-4'
                  >
                    {/* Task Type Icon Container */}
                    <View
                      className='mr-3 mt-0.5 h-7 w-7 items-center justify-center rounded-md border'
                      style={{
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      }}
                    >
                      <WorkItemIcon
                        type={item.type}
                        size={14}
                        color={colors.primary}
                      />
                    </View>

                    {/* Task Info */}
                    <View className='flex-1 justify-center'>
                      <AppText
                        variant='body'
                        className='mb-1 text-base font-bold'
                        color={colors.text}
                      >
                        {item.title}
                      </AppText>

                      {/* Key, Priority Icon, and Status Badge */}
                      <View className='flex-row items-center'>
                        <AppText
                          variant='caption'
                          className='mr-2 font-semibold'
                          color={colors.textSecondary}
                        >
                          {item.key}
                        </AppText>

                        {/* Priority / Equal indicator */}
                        <AppText
                          variant='caption'
                          className='mr-2.5 font-bold'
                          color={colors.accentOrange || colors.primary}
                        >
                          =
                        </AppText>

                        {/* Theme Adaptive Status Badge */}
                        <View
                          className='rounded-md px-2.5 py-0.5'
                          style={{ backgroundColor: badgeStyle.bg }}
                        >
                          <AppText
                            variant='caption'
                            className='text-xs font-semibold'
                            color={badgeStyle.text}
                          >
                            {item.status}
                          </AppText>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        ) : (
          <View className='flex-1 items-center justify-center py-10'>
            <AppText variant='body' color={colors.textSecondary}>
              No tasks found
            </AppText>
          </View>
        )}
      </View>
    </Screen>
  );
};

export default List;
