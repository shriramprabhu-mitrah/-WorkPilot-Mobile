import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Ionicons, {
  IoniconsIconName,
} from '@react-native-vector-icons/ionicons';
import AppText from './AppText';
import { useTheme } from '../../hooks/useTheme';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { Radius } from '../../constants/Radius';
import { User } from '../../types/auth.type';

export type HeaderVariant =
  | 'home'
  | 'createProject'
  | 'project'
  | 'quickAccess'
  | 'custom'
  | 'projectdetails';

export interface HeaderProps {
  /** Screen variant to control layout automatically */
  variant?: HeaderVariant;

  /** Dynamic Title (e.g., dynamic Project Name, Screen Title) */
  title?: string;

  /** Alignment for header title: 'center' (default) or 'left' */
  titleAlignment?: 'center' | 'left';

  onBackPress?: () => void;
  onRightActionPress?: () => void;
  rightIconName?: IoniconsIconName;

  /** Project Viewing Specific Props */
  onProjectTitlePress?: () => void;
  showDropdownIcon?: boolean; // <--- Controls dropdown arrow visibility

  /** Home Variant Specific Props */
  user?: User;
  workspaceName?: string;
  onProfilePress?: () => void;
  onDrawerPress?: () => void; // <--- Added drawer handler
  onSearchPress?: () => void;

  /** Tab Variant Specific Props */
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;

  /** Fallback Custom Slots */
  leftComponent?: React.ReactNode;
  centerComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}

export const CommonHeader: React.FC<HeaderProps> = ({
  variant = 'custom',
  title,
  titleAlignment = 'center',
  onBackPress,
  onRightActionPress,
  rightIconName,
  onProjectTitlePress,
  showDropdownIcon = true,
  user,
  workspaceName = 'reactproject',
  onProfilePress,
  onDrawerPress,
  onSearchPress,
  tabs = [],
  activeTab,
  onTabChange,
  leftComponent,
  centerComponent,
  rightComponent,
  children,
  containerStyle,
}) => {
  const { colors, strings } = useTheme();
  const { layout, moderateScale } = useAuthLayout();

  const isLeftAligned = titleAlignment === 'left' && variant !== 'home';

  // --- RENDER HELPERS BASED ON SCREEN VARIANT ---

  const renderLeft = () => {
    if (leftComponent) return leftComponent;

    switch (variant) {
      case 'home':
        return (
          /* Hamburger / Drawer Icon Button */
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onDrawerPress}
            className='items-center justify-center rounded-full border'
            style={{
              width: moderateScale(36),
              height: moderateScale(36),
              backgroundColor: colors.background,
              borderColor: colors.border,
            }}
          >
            <Ionicons
              name='menu-outline'
              size={moderateScale(24)}
              color={colors.text}
            />
          </TouchableOpacity>
        );

      case 'createProject':
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onBackPress}
            className='items-center justify-center rounded-full'
            style={{
              width: moderateScale(36),
              height: moderateScale(36),
              backgroundColor: colors.background,
              borderColor: colors.border,
            }}
          >
            <Ionicons
              name='close'
              size={moderateScale(20)}
              color={colors.text}
            />
          </TouchableOpacity>
        );

      case 'project':
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onProfilePress}
            className='items-center justify-center overflow-hidden'
            style={{
              width: moderateScale(36),
              height: moderateScale(36),
              borderRadius: Radius.circle,
              backgroundColor: user?.avatar_url
                ? 'transparent'
                : colors.accentOrange,
            }}
          >
            {user?.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: Radius.circle,
                }}
                resizeMode='cover'
              />
            ) : (
              <AppText
                style={{
                  fontSize: moderateScale(16),
                  fontWeight: 'bold',
                  color: colors.white,
                }}
              >
                {user?.name
                  ?.split(' ')
                  .map(word => word[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase() || 'P'}
              </AppText>
            )}
          </TouchableOpacity>
        );

      case 'quickAccess':
        return onBackPress ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onBackPress}
            className='items-center justify-center rounded-full'
            style={{
              width: moderateScale(36),
              height: moderateScale(36),
              backgroundColor: colors.background,
            }}
          >
            <Ionicons
              name='chevron-back'
              size={moderateScale(20)}
              color={colors.text}
            />
          </TouchableOpacity>
        ) : null;

      case 'projectdetails':
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onBackPress}
            className='items-center justify-center rounded-full'
            style={{
              width: moderateScale(36),
              height: moderateScale(36),
              backgroundColor: colors.background,
              borderColor: colors.border,
            }}
          >
            <Ionicons
              name='chevron-back-outline'
              size={moderateScale(20)}
              color={colors.text}
            />
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  const renderTitleContent = () => {
    if (centerComponent) return centerComponent;

    switch (variant) {
      case 'home':
        return (
          <AppText
            variant='body'
            className='font-bold'
            style={{ fontSize: moderateScale(18), color: colors.text }}
            numberOfLines={1}
          >
            Home
          </AppText>
        );

      case 'createProject':
        return (
          <AppText
            variant='body'
            className='font-bold'
            style={{ fontSize: moderateScale(18), color: colors.text }}
            numberOfLines={1}
          >
            {title || 'Create project'}
          </AppText>
        );

      case 'quickAccess':
        return (
          <AppText
            variant='body'
            className='font-bold'
            style={{ fontSize: moderateScale(18), color: colors.text }}
            numberOfLines={1}
          >
            {title || 'Quick access'}
          </AppText>
        );

      case 'project':
        return (
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={!onProjectTitlePress}
            onPress={onProjectTitlePress}
            className='flex-row items-center justify-center'
          >
            <AppText
              variant='title'
              className='font-bold'
              color={colors.text}
              numberOfLines={1}
            >
              {title || 'Projects'}
            </AppText>
          </TouchableOpacity>
        );

      case 'projectdetails':
        return (
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={!onProjectTitlePress}
            onPress={onProjectTitlePress}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AppText
              variant='title'
              className='font-bold'
              color={colors.text}
              numberOfLines={1}
              style={{
                fontSize: moderateScale(18),
                marginRight: moderateScale(4),
              }}
            >
              {title || 'Project Details'}
            </AppText>
            {showDropdownIcon && (
              <Ionicons
                name='chevron-down-outline'
                size={moderateScale(18)}
                color={colors.text}
              />
            )}
          </TouchableOpacity>
        );

      default:
        return title ? (
          <AppText
            variant='body'
            className='font-bold'
            style={{ fontSize: moderateScale(18), color: colors.text }}
            numberOfLines={1}
          >
            {title}
          </AppText>
        ) : null;
    }
  };

  const renderRight = () => {
    if (rightComponent) return rightComponent;

    switch (variant) {
      // case 'home':
      //   return (
      //     <TouchableOpacity
      //       activeOpacity={0.8}
      //       onPress={onRightActionPress}
      //       className='items-center justify-center rounded-full border'
      //       style={{
      //         width: moderateScale(30),
      //         height: moderateScale(30),
      //         backgroundColor: colors.primary,
      //         borderColor: colors.primary,
      //       }}
      //     >
      //       <Ionicons
      //         name='add'
      //         size={layout.iconSize * 1.1}
      //         color={colors.white}
      //       />
      //     </TouchableOpacity>
      //   );

      case 'project':
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onRightActionPress}
            className='items-center justify-center rounded-full border'
            style={{
              width: moderateScale(30),
              height: moderateScale(30),
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            }}
          >
            <Ionicons
              name={rightIconName || 'add'}
              size={layout.iconSize * 1.1}
              color={colors.white}
            />
          </TouchableOpacity>
        );

      case 'createProject':
      default:
        return null;
    }
  };

  const renderBottomSection = () => {
    if (children) return <View className='mt-3'>{children}</View>;

    if (variant === 'home') {
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onSearchPress}
          className='mt-3 flex-row items-center rounded-full border px-3 py-2'
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
          }}
        >
          <Ionicons
            name='search-outline'
            size={moderateScale(18)}
            color={colors.textSecondary}
            style={{ marginRight: layout.tightGap }}
          />
          <TextInput
            placeholder={strings.home?.searchPlaceholder || 'Search'}
            placeholderTextColor={colors.textSecondary}
            editable={false}
            pointerEvents='none'
            style={{
              flex: 1,
              color: colors.text,
              fontSize: moderateScale(14),
              padding: 0,
            }}
          />
        </TouchableOpacity>
      );
    }

    if (variant === 'project' && tabs.length > 0) {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className='mt-3 flex-row'
        >
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => onTabChange?.(tab)}
              className='mr-6 pb-2'
              style={{
                borderBottomWidth: activeTab === tab ? 2 : 0,
                borderBottomColor: colors.primary,
              }}
            >
              <AppText
                className='font-bold'
                color={activeTab === tab ? colors.text : colors.textSecondary}
              >
                {tab}
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      );
    }

    return null;
  };

  const leftElement = renderLeft();
  const rightElement = renderRight();

  return (
    <View
      className='w-full'
      style={[
        {
          backgroundColor: colors.surface,
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: layout.elementGap,
        },
        containerStyle,
      ]}
    >
      {/* Top Header Navigation Row */}
      <View className='min-h-[40px] flex-row items-center justify-between'>
        {/* Left Section */}
        <View
          className={
            isLeftAligned
              ? 'flex-row items-center'
              : 'w-10 items-start justify-center'
          }
        >
          {leftElement}
        </View>

        {/* Center / Title Section */}
        <View
          className={`flex-1 px-2 ${
            isLeftAligned ? 'items-start pl-3' : 'items-center justify-center'
          }`}
        >
          {renderTitleContent()}
        </View>

        {/* Right Section */}
        <View
          className={
            isLeftAligned
              ? 'flex-row items-center'
              : 'w-10 items-end justify-center'
          }
        >
          {rightElement ||
            (!isLeftAligned && <View style={{ width: moderateScale(36) }} />)}
        </View>
      </View>

      {/* Sub-Header Area */}
      {renderBottomSection()}
    </View>
  );
};

export default CommonHeader;
