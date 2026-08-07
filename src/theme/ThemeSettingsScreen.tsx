import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { useTheme, ThemePreference } from '../theme/ThemeProvider';
import { useAuthLayout } from '../hooks/useAuthLayout';
// import { AppText } from '../components';
import Ionicons from '@react-native-vector-icons/ionicons';
import { Radius } from '../constants/Radius';

export const ThemeSettingsScreen = () => {
  const { colors, themePreference, setThemePreference } = useTheme();
  const { moderateScale, layout } = useAuthLayout();
  const options: {
    title?: string;
    value: ThemePreference;
    icon: React.ComponentProps<typeof Ionicons>['name'];
  }[] = [
    {
      value: 'light',
      icon: 'sunny-outline',
    },
    {
      value: 'dark',
      icon: 'moon-outline',
    },
  ];
  const [containerWidth, setContainerWidth] = useState(0);
  const animatedIndex = useRef(new Animated.Value(0)).current;
  const selectedIndex = options.findIndex(opt => opt.value === themePreference);
  useEffect(() => {
    Animated.spring(animatedIndex, {
      toValue: selectedIndex !== -1 ? selectedIndex : 0,
      useNativeDriver: false,
      stiffness: 400,
      damping: 30,
      mass: 0.8,
    }).start();
  }, [selectedIndex]);
  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };
  const padding = moderateScale(3);
  const availableWidth = containerWidth - padding * 2;
  const tabWidth = availableWidth / options.length;
  const translateX = animatedIndex.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, tabWidth, tabWidth * 2],
  });
  const trackHeight = moderateScale(35);

  return (
    <View
      className='flex-1'
      style={{
        width: moderateScale(100),
        backgroundColor: colors.background,
        gap: layout.sectionGap,
      }}
    >
      <View
        className='relative flex-row items-center border'
        style={{
          height: trackHeight,
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: Radius.circle,
        }}
        onLayout={handleLayout}
      >
        {containerWidth > 0 && (
          <Animated.View
            className='absolute shadow-sm'
            style={{
              top: padding,
              bottom: padding,
              left: padding,
              width: tabWidth,
              transform: [{ translateX }],
              backgroundColor: colors.primary,
              borderRadius: Radius.circle,
            }}
          />
        )}
        {options.map(option => {
          const isSelected = themePreference === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.7}
              className='z-10 h-full flex-1 items-center justify-center'
              onPress={() => setThemePreference(option.value)}
            >
              <Ionicons
                name={option.icon}
                size={moderateScale(18)}
                color={isSelected ? colors.white : colors.textSecondary}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
