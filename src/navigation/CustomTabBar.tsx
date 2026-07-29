import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { BlurView } from '@react-native-community/blur';
import Ionicons, {
  type IoniconsIconName,
} from '@react-native-vector-icons/ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '../components/common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useResponsive } from '../utils/responsive';

const ICONS: Record<
  string,
  {
    active: IoniconsIconName;
    inactive: IoniconsIconName;
  }
> = {
  Home: {
    active: 'home',
    inactive: 'home-outline',
  },
  Projects: {
    active: 'folder',
    inactive: 'folder-outline',
  },
  Search: {
    active: 'search',
    inactive: 'search-outline',
  },
  Profile: {
    active: 'person',
    inactive: 'person-outline',
  },
};

interface TabButtonProps {
  route: any;
  index: number;
  state: BottomTabBarProps['state'];
  navigation: BottomTabBarProps['navigation'];
}

const TabButton = ({ route, index, state, navigation }: TabButtonProps) => {
  const { colors } = useTheme();
  const { wp, hp, moderateScale } = useResponsive();
  const focused = state.index === index;
  const scale = useSharedValue(focused ? 1 : 0.95);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1 : 0.95, {
      damping: 14,
      stiffness: 180,
    });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: scale.value,
      },
    ],
  }));

  const icon = ICONS[route.name] || {
    active: 'square',
    inactive: 'square-outline',
  };

  const onPress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!focused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={{
        flex: 1,
        alignItems: 'center',
      }}
      onPress={onPress}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            minWidth: wp(18),
            height: hp(5.8),
            borderRadius: moderateScale(40),
            backgroundColor: focused ? colors.primary : 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            paddingHorizontal: focused ? wp(4) : 0,
          },
        ]}
      >
        <Ionicons
          name={focused ? icon.active : icon.inactive}
          size={focused ? moderateScale(22) : moderateScale(20)}
          color={focused ? colors.white : colors.textSecondary}
        />

        {focused && (
          <AppText
            variant='caption'
            color={colors.white}
            style={{
              marginLeft: moderateScale(6),
              fontWeight: '600',
            }}
          >
            {route.name}
          </AppText>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const { colors, mode } = useTheme();
  const { wp, hp, moderateScale } = useResponsive();
  const insets = useSafeAreaInsets();

  const isDark = mode === 'dark';

  // Native Blur configuration derived directly from ThemeContext
  const blurType = isDark ? 'dark' : 'light';
  const fallbackColor = colors.surface;

  // Adapt container background translucent tint per theme & platform
  const overlayBackgroundColor = Platform.select({
    ios: isDark ? 'rgba(18, 18, 18, 0.45)' : 'rgba(255, 255, 255, 0.5)',
    android: colors.surface,
    default: colors.surface,
  });

  return (
    <View
      pointerEvents='box-none'
      style={[
        styles.wrapper,
        {
          left: wp(4),
          right: wp(4),
          bottom: insets.bottom + hp(1.2),
        },
      ]}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: moderateScale(32),
            overflow: 'hidden',
          },
        ]}
      >
        <BlurView
          blurType={blurType}
          blurAmount={80}
          reducedTransparencyFallbackColor={fallbackColor}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View
        style={[
          styles.overlay,
          {
            height: hp(8),
            borderRadius: moderateScale(32),
            backgroundColor: overlayBackgroundColor,
            borderColor: colors.border,
            paddingHorizontal: wp(2),
            shadowColor: colors.black,
          },
        ]}
      >
        {state.routes.map((route, index) => (
          <TabButton
            key={route.key}
            route={route}
            index={index}
            state={state}
            navigation={navigation}
          />
        ))}
      </View>
    </View>
  );
};

export default CustomTabBar;

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
  },
  overlay: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 18,
    overflow: 'hidden',
  },
});
