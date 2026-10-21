import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useTheme } from '../theme/ThemeProvider';
import AppText from './common/AppText';
import { getInitials } from '../utils/utils';

export interface UserProfileData {
  full_name?: string;
  user_name?: string;
  email?: string;
  avatar_url?: string;
  color?: string;
  role?: string;
  username?: string;
}

interface UserProfileCardProps {
  user: UserProfileData;
  isProjectContext: boolean;
  totalCount: number;
  onImagePress?: () => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  user,
  isProjectContext,
  totalCount,
  onImagePress,
}) => {
  const { colors } = useTheme();
  const { moderateScale, isSmallHeight } = useAuthLayout();

  const avatarSize = isSmallHeight ? moderateScale(56) : moderateScale(64);
  const borderRadius = avatarSize / 2;

  const AvatarDisplay = (
    <>
      {user.avatar_url ? (
        <Image
          source={{ uri: user.avatar_url }}
          style={{ width: avatarSize, height: avatarSize, borderRadius }}
        />
      ) : (
        <View
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: user.color || colors.primary,
          }}
        >
          <AppText
            variant='h3'
            color={colors.white}
            style={{ fontWeight: '700' }}
          >
            {getInitials(user.full_name)}
          </AppText>
        </View>
      )}
    </>
  );

  return (
    <View
      style={{
        padding: moderateScale(18),
        borderRadius: moderateScale(18),
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(14),
        }}
      >
        {user.avatar_url && onImagePress ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onImagePress}
            accessible
            accessibilityLabel='View profile image'
          >
            {AvatarDisplay}
          </TouchableOpacity>
        ) : (
          AvatarDisplay
        )}

        <View style={{ flex: 1 }}>
          <AppText variant='h3' numberOfLines={2} style={{ fontWeight: '800' }}>
            {user.full_name}
          </AppText>
          {!!user.user_name && (
            <AppText
              variant='caption'
              color={colors.textSecondary}
              style={{ marginTop: 2 }}
            >
              @{user.user_name}
            </AppText>
          )}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: moderateScale(5),
              alignSelf: 'flex-start',
              marginTop: moderateScale(7),
              paddingHorizontal: moderateScale(9),
              paddingVertical: moderateScale(4),
              borderRadius: moderateScale(8),
              backgroundColor: `${colors.primary}18`,
            }}
          >
            <Ionicons
              name='shield-checkmark-outline'
              size={moderateScale(14)}
              color={colors.primary}
            />
            <AppText
              variant='caption'
              color={colors.primary}
              style={{ fontWeight: '700' }}
            >
              {user.role}
            </AppText>
          </View>
        </View>
      </View>

      <View
        style={{
          height: 1,
          backgroundColor: colors.border,
          marginVertical: moderateScale(14),
        }}
      />

      <View style={{ flexDirection: 'row', gap: moderateScale(14) }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: moderateScale(7),
          }}
        >
          <Ionicons
            name='mail-outline'
            size={moderateScale(16)}
            color={colors.textSecondary}
          />
          <AppText
            variant='caption'
            color={colors.textSecondary}
            numberOfLines={1}
            style={{ flexShrink: 1 }}
          >
            {user.email || 'No email address'}
          </AppText>
        </View>

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: moderateScale(7),
          }}
        >
          <Ionicons
            name={isProjectContext ? 'checkbox-outline' : 'folder-outline'}
            size={moderateScale(16)}
            color={colors.textSecondary}
          />
          <AppText
            variant='caption'
            color={colors.textSecondary}
            numberOfLines={1}
            style={{ flexShrink: 1 }}
          >
            {isProjectContext
              ? `${totalCount} tasks`
              : `${totalCount} projects`}
          </AppText>
        </View>
      </View>
    </View>
  );
};

export default React.memo(UserProfileCard);
