import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { useTheme, ThemePreference } from '../theme/ThemeProvider';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { AppText } from '../components';

export const ThemeSettingsScreen = () => {
  const { colors, themePreference, setThemePreference, strings } = useTheme();

  // Responsive hook destructure
  const { fontScale, moderateScale, verticalScale, layout } = useAuthLayout();

  const options: { label: string; value: ThemePreference }[] = [
    { label: `${strings.theme.system}`, value: 'system' },
    { label: `${strings.theme.light}`, value: 'light' },
    { label: `${strings.theme.dark}`, value: 'dark' },
  ];

  // Track width dynamically for sliding calculations
  const [containerWidth, setContainerWidth] = useState(0);

  // Animated value for sliding position
  const animatedIndex = useRef(new Animated.Value(0)).current;

  // Selected option index
  const selectedIndex = options.findIndex(opt => opt.value === themePreference);

  // Animate indicator position on selection change
  useEffect(() => {
    Animated.spring(animatedIndex, {
      toValue: selectedIndex !== -1 ? selectedIndex : 0,
      useNativeDriver: false,
      friction: 8,
      tension: 60,
    }).start();
  }, [selectedIndex, animatedIndex]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  // Dimensions for sliding pill width and offset using responsive padding
  const padding = moderateScale(4);
  const availableWidth = containerWidth - padding * 2;
  const tabWidth = availableWidth / options.length;

  const translateX = animatedIndex.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, tabWidth, tabWidth * 2],
  });

  // Responsive track height
  const trackHeight = verticalScale(48);

  return (
    <View
      className='flex-1'
      style={{
        backgroundColor: colors.background,
        paddingHorizontal: layout.paddingHorizontal,
        paddingTop: layout.paddingTop,
        paddingBottom: layout.paddingBottom,
        gap: layout.sectionGap,
      }}
    >
      {/* Outer Segment Track */}
      <View
        className='relative flex-row items-center rounded-full border'
        style={{
          height: trackHeight,
          padding,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
        onLayout={handleLayout}
      >
        {/* Animated Sliding Background Pill */}
        {containerWidth > 0 && (
          <Animated.View
            className='absolute rounded-full shadow-sm'
            style={{
              top: padding,
              bottom: padding,
              left: padding,
              width: tabWidth,
              transform: [{ translateX }],
              backgroundColor: colors.primary,
            }}
          />
        )}

        {/* Option Tabs */}
        {options.map(option => {
          const isSelected = themePreference === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.7}
              className='z-10 h-full flex-1 items-center justify-center'
              onPress={() => setThemePreference(option.value)}
            >
              <Text
                className={isSelected ? 'font-bold' : 'font-medium'}
                style={{
                  fontSize: fontScale(14),
                  // Active state uses white/high-contrast text over primary background, inactive uses textSecondary
                  color: isSelected ? colors.white : colors.textSecondary,
                }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <AppText
        variant='caption'
        color={colors.textSecondary}
        className='text-center'
      >
        {strings.theme.note}
      </AppText>
    </View>
  );
};
