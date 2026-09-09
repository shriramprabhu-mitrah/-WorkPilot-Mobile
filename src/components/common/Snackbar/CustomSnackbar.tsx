import React from 'react';
import { View, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Snackbar } from 'react-native-paper';
import AppText from '../AppText';
import AppLaunchLogo from '../../../assets/svg/splasScreenlogo';
import { useResponsive } from '../../../utils/responsive';
import { useTheme } from '../../../hooks/useTheme';
import Svg, { Path, Circle } from 'react-native-svg';

export type SnackbarType = 'default' | 'success' | 'error' | 'info' | 'warning';
export type SnackbarIconMode = 'both' | 'logo' | 'status';

export interface CustomSnackbarProps {
  /** Visibility of the snackbar */
  visible: boolean;
  /** Callback triggered when snackbar is dismissed or duration expires */
  onDismiss: () => void;
  /** Dynamic message to display */
  message: string;
  /**
   * Type of message:
   * - 'success': App logo with green checkmark badge
   * - 'error': App logo with red cross badge
   * - 'warning': App logo with amber alert badge
   * - 'info': App logo with blue info badge
   * - 'default': App logo without badge
   */
  type?: SnackbarType;
  /**
   * Icon display mode:
   * - 'both' (Default, Hybrid): App logo + status badge
   * - 'logo': App logo only
   * - 'status': Pure status icon
   */
  iconMode?: SnackbarIconMode;
  /** Duration in milliseconds before auto-dismiss (default: 3000ms) */
  duration?: number;
  /** Custom logo component if you want to override the default AppLaunchLogo */
  customLogo?: React.ReactNode;
  /** Optional container style override */
  style?: StyleProp<ViewStyle>;
  /** Optional message text style override */
  textStyle?: StyleProp<TextStyle>;
  /** Bottom offset from screen edge (default: 30) */
  bottomOffset?: number;
  /** Optional action button on the snackbar */
  action?: {
    label: string;
    onPress: () => void;
    textColor?: string;
  };
}

// Mini Success Check Badge SVG
const CheckBadgeIcon = ({
  size,
  color,
  iconColor,
}: {
  size: number;
  color: string;
  iconColor: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Circle cx="10" cy="10" r="10" fill={color} />
    <Path
      d="M5.8 10.2L8.6 13L14.2 7"
      stroke={iconColor}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Mini Error Cross Badge SVG
const ErrorBadgeIcon = ({
  size,
  color,
  iconColor,
}: {
  size: number;
  color: string;
  iconColor: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Circle cx="10" cy="10" r="10" fill={color} />
    <Path
      d="M6.5 6.5L13.5 13.5M13.5 6.5L6.5 13.5"
      stroke={iconColor}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </Svg>
);

// Mini Warning Badge SVG
const WarningBadgeIcon = ({
  size,
  color,
  iconColor,
}: {
  size: number;
  color: string;
  iconColor: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Circle cx="10" cy="10" r="10" fill={color} />
    <Path
      d="M10 6V11M10 14V14.5"
      stroke={iconColor}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </Svg>
);

// Mini Info Badge SVG
const InfoBadgeIcon = ({
  size,
  color,
  iconColor,
}: {
  size: number;
  color: string;
  iconColor: string;
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Circle cx="10" cy="10" r="10" fill={color} />
    <Path
      d="M10 6.5V7M10 9.5V14"
      stroke={iconColor}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const CustomSnackbar: React.FC<CustomSnackbarProps> = ({
  visible,
  onDismiss,
  message,
  type = 'default',
  iconMode = 'both',
  duration = 3000,
  customLogo,
  style,
  textStyle,
  bottomOffset = 30,
  action,
}) => {
  const { colors } = useTheme();
  const { moderateScale, verticalScale } = useResponsive();

  const renderStatusBadge = (size: number) => {
    switch (type) {
      case 'success':
        return (
          <CheckBadgeIcon
            size={size}
            color={colors.success}
            iconColor={colors.white}
          />
        );
      case 'error':
        return (
          <ErrorBadgeIcon
            size={size}
            color={colors.error}
            iconColor={colors.white}
          />
        );
      case 'warning':
        return (
          <WarningBadgeIcon
            size={size}
            color={colors.warning}
            iconColor={colors.white}
          />
        );
      case 'info':
        return (
          <InfoBadgeIcon
            size={size}
            color={colors.info}
            iconColor={colors.white}
          />
        );
      default:
        return null;
    }
  };

  const renderIcon = () => {
    // Mode 1: Status icon only
    if (iconMode === 'status') {
      return (
        <View
          className="w-7 h-7 rounded-md items-center justify-center border-[0.5px] shadow-sm"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          {renderStatusBadge(moderateScale(16))}
        </View>
      );
    }

    // Mode 2: Hybrid (App launch logo + Status badge) OR Logo-only
    return (
      <View className="relative items-center justify-center">
        {/* App Launch Logo Card with increased logo size */}
        <View
          className="w-7 h-7 rounded-md items-center justify-center border-[0.5px] shadow-sm"
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
          }}
        >
          {customLogo || (
            <AppLaunchLogo
              width={moderateScale(20)}
              height={moderateScale(20)}
              color={colors.primary}
            />
          )}
        </View>

        {/* Hybrid Badge: overlapping bottom-right corner */}
        {iconMode === 'both' && type !== 'default' && (
          <View
            className="absolute -bottom-1 -right-1 rounded-full border-[1.5px] items-center justify-center shadow-sm"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.card,
            }}
          >
            {renderStatusBadge(moderateScale(11))}
          </View>
        )}
      </View>
    );
  };

  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={duration}
      action={action}
      wrapperStyle={{
        position: 'absolute',
        bottom: verticalScale(bottomOffset),
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        pointerEvents: 'box-none',
      }}
      contentStyle={{
        marginHorizontal: 0,
        marginVertical: 0,
        paddingHorizontal: 0,
        paddingVertical: 0,
        flex: 0,
        flexGrow: 0,
        alignSelf: 'center',
      }}
      style={{
        backgroundColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
        margin: 0,
        padding: 0,
        minHeight: 0,
        alignSelf: 'center',
        width: 'auto',
      }}
    >
      {/* Visual Compact Pill: Auto-widths to only the contents like the attached screenshot */}
      <View
        className="flex-row items-center self-center rounded-full border shadow-sm"
        style={[
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            paddingLeft: moderateScale(6),
            paddingRight: moderateScale(14),
            paddingVertical: verticalScale(4),
            borderRadius: 22,
            minHeight: 38,
            alignSelf: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 4,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 4,
          },
          style,
        ]}
      >
        {renderIcon()}

        {/* Dynamic message using AppText common component */}
        <AppText
          variant="body"
          color={colors.text}
          className="font-medium text-xs flex-shrink"
          style={[
            {
              fontSize: moderateScale(12.5),
              fontWeight: '600',
              marginLeft: moderateScale(8),
              marginRight: moderateScale(2),
            },
            textStyle,
          ]}
          numberOfLines={1}
        >
          {message}
        </AppText>
      </View>
    </Snackbar>
  );
};

export default CustomSnackbar;
