import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { WorkItemIcon } from '../../components/common/getWorkItemIcon';
import { AppText } from '../../components';

export interface FeatureToggle {
  id: string;
  title: string;
  description: string;
  isEnabled: boolean;
  type: string;
}

export const Features: React.FC = () => {
  const { colors } = useTheme();
  const { layout, moderateScale } = useAuthLayout();

  const [features, setFeatures] = useState<FeatureToggle[]>([
    {
      id: 'summary',
      title: 'Summary',
      description: 'Get an overview of space health and activity.',
      isEnabled: true,
      type: 'summary',
    },
    {
      id: 'board',
      title: 'Board',
      description: 'Visualize work items on a Kanban or Scrum board.',
      isEnabled: true,
      type: 'board',
    },
    {
      id: 'backlog',
      title: 'Backlog',
      description: 'Plan and prioritize your team’s work in a dedicated space.',
      isEnabled: true,
      type: 'backlog',
    },
    {
      id: 'timeline',
      title: 'Timeline',
      description:
        'Your timeline is an optimized location to create and manage epics.',
      isEnabled: true,
      type: 'timeline',
    },
    {
      id: 'reports',
      title: 'Reports',
      description:
        'Analyze and track your team’s work by reporting on project activity.',
      isEnabled: false,
      type: 'reports',
    },
  ]);

  const toggleFeature = (id: string) => {
    setFeatures(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isEnabled: !item.isEnabled } : item,
      ),
    );
  };

  return (
    <ScrollView
      className='flex-1 px-4 py-4'
      contentContainerStyle={{ gap: layout.elementGap }}
      showsVerticalScrollIndicator={false}
    >
      {features.map(item => (
        <View
          key={item.id}
          className='mb-3 rounded-2xl border p-4'
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
          }}
        >
          <View className='flex-row items-start justify-between'>
            <View className='mr-3 flex-1 flex-row items-start'>
              <View
                className='mr-3 items-center justify-center rounded-xl border p-2.5'
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <WorkItemIcon
                  type={item.type}
                  size={moderateScale(24)}
                  color={colors.primary}
                />
              </View>

              <View className='flex-1'>
                <AppText
                  variant='body'
                  className='mb-1 font-bold'
                  color={colors.text}
                  style={{ fontSize: moderateScale(15) }}
                >
                  {item.title}
                </AppText>
                <AppText
                  variant='caption'
                  color={colors.textSecondary}
                  style={{
                    fontSize: moderateScale(12),
                    lineHeight: moderateScale(16),
                  }}
                >
                  {item.description}
                </AppText>

                <TouchableOpacity activeOpacity={0.7} className='mt-2'>
                  <AppText
                    variant='caption'
                    className='font-semibold'
                    color={colors.primary}
                  >
                    Learn more
                  </AppText>
                </TouchableOpacity>
              </View>
            </View>

            <Switch
              value={item.isEnabled}
              onValueChange={() => toggleFeature(item.id)}
              trackColor={{
                false: colors.border,
                true: colors.primary,
              }}
              thumbColor={colors.white}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
};
