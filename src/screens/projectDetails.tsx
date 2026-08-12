import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { moderateScale } from '../utils/responsive';
import { Radius } from '../constants/Radius';
import { AppText } from '../components';
import Screen from '../components/common/ScreenWapper';

const BoardView = () => (
  <View className='flex-1 items-center justify-center py-10'>
    <AppText variant='body'>Board View Content</AppText>
  </View>
);
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
        return <BoardView />;
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
