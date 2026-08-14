import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { moderateScale } from '../utils/responsive';
import { Radius } from '../constants/Radius';
import { AppText } from '../components';
import Screen from '../components/common/ScreenWapper';
import ProjectBoardScreen from './ProjectBoardScreen';

const columns = [
  {
    id: 'todo',
    title: 'To Do',
    tasks: [
      { id: '1', title: 'Create project setup' },
      { id: '2', title: 'Design login screen' },
    ],
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    tasks: [
      { id: '3', title: 'Implement dashboard' },
      { id: '4', title: 'Integrate APIs' },
    ],
  },
  {
    id: 'in-review',
    title: 'In Review',
    tasks: [{ id: '5', title: 'Review authentication' }],
  },
  {
    id: 'done',
    title: 'Done',
    tasks: [
      { id: '6', title: 'Create project screen' },
      { id: '7', title: 'Setup navigation' },
    ],
  },
];

const BoardColumn = ({
  title,
  tasks,
}: {
  title: string;
  tasks: { id: string; title: string }[];
}) => (
  <View className='mr-4 w-[300px] rounded-xl bg-gray-100 p-3'>
    {/* Column Header */}
    <View className='mb-3 flex-row items-center justify-between'>
      <AppText variant='body'>{title}</AppText>

      <AppText variant='body'>{tasks.length}</AppText>
    </View>

    {/* Cards */}
    {tasks.map(task => (
      <TouchableOpacity key={task.id} className='mb-3 rounded-lg bg-white p-4'>
        <AppText variant='body'>{task.title}</AppText>
      </TouchableOpacity>
    ))}

    {/* Add Task */}
    <TouchableOpacity className='py-3'>
      <AppText variant='body'>+ Add task</AppText>
    </TouchableOpacity>
  </View>
);

const BoardView = () => {
  return (
    <View className='flex-1'>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
        }}
      >
        {columns.map(column => (
          <BoardColumn
            key={column.id}
            title={column.title}
            tasks={column.tasks}
          />
        ))}

        {/* Add New Column */}
        <TouchableOpacity className='h-[120px] w-[300px] items-center justify-center rounded-xl border border-dashed border-gray-400'>
          <AppText variant='body'>+ Add new column</AppText>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const ListView = () => (
  <View className='flex-1 items-center justify-center py-10'>
    <AppText variant='body'>List View Content</AppText>
  </View>
);
const CalendarView = () => (
  <View className='flex-1 items-center justify-center py-10'>
    <AppText variant='body'>Calendar View Content</AppText>
  </View>
);
const FormsView = () => (
  <View className='flex-1 items-center justify-center py-10'>
    <AppText variant='body'>Forms View Content</AppText>
  </View>
);
const BacklogsView = () => (
  <View className='flex-1 items-center justify-center py-10'>
    <AppText variant='body'>Backlogs View Content</AppText>
  </View>
);
const TimelineView = () => (
  <View className='flex-1 items-center justify-center py-10'>
    <AppText variant='body'>Timeline View Content</AppText>
  </View>
);
const SettingsView = () => (
  <View className='flex-1 items-center justify-center py-10'>
    <AppText variant='body'>Settings View Content</AppText>
  </View>
);

const TABS = [
  'Summary',
  'Board',
  'List',
  'Calendar',
  'Forms',
  'Backlogs',
  'Timeline',
  'Settings',
] as const;

type TabType = (typeof TABS)[number];

const ProjectDetails = () => {
  const { colors } = useTheme();
  const { layout } = useAuthLayout();
  const [activeTab, setActiveTab] = useState<TabType>('Summary');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Summary':
        return (
          <View className='flex-1 items-center justify-center py-10'>
            <AppText variant='body'>Summary View Content</AppText>
          </View>
        );
      case 'Board':
        return <ProjectBoardScreen />;
      case 'List':
        return <ListView />;
      case 'Calendar':
        return <CalendarView />;
      case 'Forms':
        return <FormsView />;
      case 'Backlogs':
        return <BacklogsView />;
      case 'Timeline':
        return <TimelineView />;
      case 'Settings':
        return <SettingsView />;
      default:
        return null;
    }
  };

  return (
    <Screen scroll={false}>
      <View
        style={{
          paddingHorizontal: layout.paddingHorizontal || moderateScale(16),
          paddingVertical: moderateScale(12),
        }}
        className='flex-row items-center justify-between'
      >
        <TouchableOpacity
          style={{
            width: moderateScale(36),
            height: moderateScale(36),
            borderRadius: Radius.circle || 18,
            backgroundColor: '#18181b',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name='chevron-back-outline'
            size={layout.iconSize || 20}
            color={colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity className='flex-row items-center'>
          <AppText
            variant='title'
            className='mr-1 text-lg font-bold'
            style={{ color: colors.text }}
          >
            Workpilot
          </AppText>
          <Ionicons name='caret-down-sharp' size={12} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            width: moderateScale(36),
            height: moderateScale(36),
            borderRadius: Radius.circle,
            backgroundColor: '#18181b',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name='share-outline'
            size={layout.iconSize || 20}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: layout.paddingHorizontal || moderateScale(16),
            alignItems: 'center',
          }}
        >
          <TouchableOpacity
            style={{ paddingRight: moderateScale(12) }}
            className='justify-center'
          >
            <Ionicons
              name='menu-outline'
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {TABS.map(tab => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  paddingVertical: moderateScale(10),
                  paddingHorizontal: moderateScale(12),
                  borderBottomWidth: 2,
                  borderBottomColor: isActive ? colors.primary : 'transparent',
                }}
              >
                <AppText
                  variant='body'
                  className={isActive ? 'font-bold' : 'font-normal'}
                  style={{
                    color: isActive ? colors.primary : colors.textSecondary,
                    fontSize: moderateScale(14),
                  }}
                >
                  {tab}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      <ScrollView
        className='flex-1'
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.paddingHorizontal || moderateScale(16),
          paddingTop: moderateScale(16),
          paddingBottom: moderateScale(24),
        }}
      >
        {renderTabContent()}
      </ScrollView>
    </Screen>
  );
};

export default ProjectDetails;
