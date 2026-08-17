import React, { useCallback } from 'react';
import { View, TouchableOpacity, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { WorkItemIcon } from '../../components/common/getWorkItemIcon';
import { AppText } from '../../components';
import { UpdateProjectDetails } from './updateProjectDetails';
// import { Features } from './features';

export type ViewState = 'MAIN_SETTINGS' | 'DETAILS' | 'FEATURES';

interface SettingsProps {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  projectNameValue?: string;
}

export const Settings: React.FC<SettingsProps> = ({
  currentView,
  setCurrentView,
  projectNameValue,
}) => {
  const { colors } = useTheme();
  const { layout, moderateScale } = useAuthLayout();

  // Handle hardware back press for nested sub-views
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (currentView !== 'MAIN_SETTINGS') {
          setCurrentView('MAIN_SETTINGS');
          return true; // Stops screen from popping out of tab view
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => subscription.remove();
    }, [currentView, setCurrentView]),
  );

  /* Root Settings Navigation Screen */
  const renderMainSettings = () => (
    <View className='flex-1 p-4' style={{ gap: layout.sectionGap }}>
      <View
        className='rounded-2xl border p-2'
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setCurrentView('DETAILS')}
          className='flex-row items-center justify-between p-4'
          style={{ borderColor: colors.border }}
        >
          <AppText
            variant='body'
            className='font-semibold'
            color={colors.text}
            style={{ fontSize: moderateScale(15) }}
          >
            Details
          </AppText>
          <WorkItemIcon
            type='chevron-right'
            size={moderateScale(16)}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        {/* <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setCurrentView('FEATURES')}
            className='flex-row items-center justify-between p-4'
          >
            <AppText
              variant='body'
              className='font-semibold'
              color={colors.text}
              style={{ fontSize: moderateScale(15) }}
            >
              Features
            </AppText>
            <WorkItemIcon
              type='chevron-right'
              size={moderateScale(16)}
              color={colors.textSecondary}
            />
          </TouchableOpacity> */}
      </View>
    </View>
  );

  return (
    <View className='flex-1' style={{ backgroundColor: colors.surface }}>
      {currentView === 'MAIN_SETTINGS' && renderMainSettings()}
      {currentView === 'DETAILS' && (
        <UpdateProjectDetails initialProjectName={projectNameValue} />
      )}
      {/* {currentView === 'FEATURES' && <Features />} */}
    </View>
  );
};

export default Settings;
