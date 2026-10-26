import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import AppText from '../../common/AppText';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthLayout } from '../../../hooks/useAuthLayout';
import { SearchItem } from '../../../types/home.type';
import { Radius } from '../../../constants/Radius';
import Ionicons from '@react-native-vector-icons/ionicons';

interface SearchMemberCardProps {
  item: SearchItem;
  onPress: (item: SearchItem) => void;
}

const getInitials = (item: SearchItem) => {
  const rawName =
    item.name ||
    item.full_name ||
    item.title ||
    item.user_name ||
    item.username ||
    'U';
  const parts = rawName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (rawName[0] || 'U').toUpperCase();
};

export const SearchMemberCard = React.memo<SearchMemberCardProps>(
  ({ item, onPress }) => {
    const { colors } = useTheme();
    const { moderateScale } = useAuthLayout();

    const displayName =
      item.name || item.full_name || item.title || 'Team Member';
    const username = item.user_name || item.username;
    const isOrgAdminRole = item.role === 'org_admin';
    const initials = getInitials(item);
    const avatarBg = item.color || colors.primary;

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => onPress(item)}
        className='border'
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: Radius.sm,
          padding: moderateScale(14),
          marginBottom: moderateScale(10),
        }}
      >
        <View className='flex-row items-center'>
          {/* Avatar */}
          <View
            className='items-center justify-center overflow-hidden'
            style={{
              width: moderateScale(48),
              height: moderateScale(48),
              borderRadius: Radius.circle,
              backgroundColor: avatarBg,
            }}
          >
            {item.avatar_url ? (
              <Image
                source={{ uri: item.avatar_url }}
                style={{
                  width: '100%',
                  height: '100%',
                }}
                resizeMode='cover'
              />
            ) : (
              <AppText
                variant='body'
                className='font-bold'
                style={{
                  fontSize: moderateScale(18),
                  color: colors.white,
                }}
              >
                {initials}
              </AppText>
            )}
          </View>

          {/* Member Details */}
          <View
            className='flex-1 justify-center'
            style={{ marginLeft: moderateScale(12) }}
          >
            <View className='flex-row items-center justify-between'>
              <AppText
                variant='bodyLarge'
                className='mr-2 flex-1 font-bold'
                color={colors.text}
                numberOfLines={1}
                style={{ fontSize: moderateScale(15) }}
              >
                {displayName}
              </AppText>

              {/* Role Badge */}
              <View
                className='flex-row items-center'
                style={{
                  backgroundColor: isOrgAdminRole
                    ? `${colors.primary}18`
                    : colors.surface,
                  borderWidth: 1,
                  borderColor: isOrgAdminRole
                    ? `${colors.primary}40`
                    : colors.border,
                  borderRadius: Radius.pill,
                  paddingHorizontal: moderateScale(8),
                  paddingVertical: moderateScale(2.5),
                  gap: moderateScale(4),
                }}
              >
                <Ionicons
                  name={isOrgAdminRole ? 'shield-checkmark' : 'person-outline'}
                  size={moderateScale(10)}
                  color={isOrgAdminRole ? colors.primary : colors.textSecondary}
                />
                <AppText
                  variant='caption'
                  style={{
                    fontSize: moderateScale(10),
                    fontWeight: '600',
                    color: isOrgAdminRole
                      ? colors.primary
                      : colors.textSecondary,
                  }}
                >
                  {isOrgAdminRole ? 'Org Admin' : 'Member'}
                </AppText>
              </View>
            </View>

            {username && (
              <AppText
                variant='caption'
                color={colors.textSecondary}
                numberOfLines={1}
                style={{
                  fontSize: moderateScale(12),
                  marginTop: moderateScale(2),
                }}
              >
                @{username}
              </AppText>
            )}

            {item.email && (
              <View
                className='flex-row items-center'
                style={{
                  marginTop: moderateScale(4),
                  gap: moderateScale(4),
                }}
              >
                <Ionicons
                  name='mail-outline'
                  size={moderateScale(12)}
                  color={colors.textSecondary}
                />
                <AppText
                  variant='caption'
                  color={colors.textSecondary}
                  numberOfLines={1}
                  className='flex-1'
                  style={{ fontSize: moderateScale(11) }}
                >
                  {item.email}
                </AppText>
              </View>
            )}
          </View>

          {/* Chevron */}
          <Ionicons
            name='chevron-forward'
            size={moderateScale(16)}
            color={colors.textSecondary}
            style={{ marginLeft: moderateScale(8) }}
          />
        </View>
      </TouchableOpacity>
    );
  },
);
