import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { moderateScale } from '../utils/responsive';
import { Radius } from '../constants/Radius';
import { AppText } from '../components';
import Screen from '../components/common/ScreenWapper';
import ProjectTopNavigator from '../navigation/projectTopNavigator';
import CommonHeader from '../components/common/CommonHeader';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigationTypes';

const ProjectDetails = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const { layout } = useAuthLayout();

  return (
    <Screen scroll={false}>
      <CommonHeader
        variant='projectdetails'
        title='projectName'
        onBackPress={() => {
          navigation.goBack();
        }}
      />
      {/* <View
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
            backgroundColor: colors.surface,
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
            backgroundColor: colors.surface,
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
      </View> */}
      <View className='flex-1'>
        <ProjectTopNavigator />
      </View>
    </Screen>
  );
};

export default ProjectDetails;
