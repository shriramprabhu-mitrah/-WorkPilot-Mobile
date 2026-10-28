import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Radius } from '../constants/Radius';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useTheme } from '../hooks/useTheme';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

export interface SwipeableOptionAction {
  key: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  accessibilityLabel: string;
  onPress: () => void;
  width: number;
  color?: string;
  disabled?: boolean;
  iconSize?: number;
  borderRadius?: number;
}

interface Props {
  children: React.ReactNode;
  actions: SwipeableOptionAction[];
  actionWidth: number;
  enabled?: boolean;
  leftInset?: number;
  gap?: number;
  rightThreshold?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

interface SwipeActionRevealProps {
  progress: SharedValue<number>;
  actionWidth: number;
  children: React.ReactNode;
}

const SwipeActionReveal = ({
  progress,
  actionWidth,
  children,
}: SwipeActionRevealProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0, 1],
          [actionWidth, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <Animated.View
      pointerEvents='box-none'
      style={[{ height: '100%' }, animatedStyle]}
    >
      {children}
    </Animated.View>
  );
};

const SwipeableOption = ({
  children,
  actions,
  actionWidth,
  enabled = true,
  leftInset = 0,
  gap = 0,
  rightThreshold = 40,
  containerStyle,
}: Props) => {
  const { colors } = useTheme();
  const { moderateScale } = useAuthLayout();
  const canSwipe = enabled && actions.length > 0;

  const renderActions = (progress: SharedValue<number>) => {
    if (!canSwipe) return null;

    return (
      <SwipeActionReveal progress={progress} actionWidth={actionWidth}>
        <View style={[styles.actions, { marginLeft: leftInset, gap }]}>
          {actions.map(action => {
            const disabled = Boolean(action.disabled);
            return (
              <TouchableOpacity
                key={action.key}
                activeOpacity={0.8}
                onPress={disabled ? undefined : action.onPress}
                disabled={disabled}
                accessibilityRole='button'
                accessibilityLabel={action.accessibilityLabel}
                style={{
                  width: action.width,
                  height: '100%',
                  borderRadius: action.borderRadius ?? Radius.md,
                  backgroundColor: action.color || colors.error,
                  opacity: disabled ? 0.35 : 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name={action.icon}
                  size={action.iconSize ?? moderateScale(22)}
                  color={colors.white}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </SwipeActionReveal>
    );
  };

  return (
    <Swipeable
      enabled={canSwipe}
      renderRightActions={renderActions}
      overshootRight={false}
      rightThreshold={rightThreshold}
      containerStyle={containerStyle}
    >
      {children}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
});

export default SwipeableOption;
