import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import AppText from '../../common/AppText';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthLayout } from '../../../hooks/useAuthLayout';
import { SearchItem } from '../../../types/home.type';
import {
  getStatusThemeColor,
  getPriorityThemeColor,
  getStatusLabel,
  getPriorityLabel,
} from '../../../utils/enum';
import { Radius } from '../../../constants/Radius';
import Ionicons from '@react-native-vector-icons/ionicons';

interface SearchUserStoryCardProps {
  item: SearchItem;
  onPress: (item: SearchItem) => void;
}

export const SearchUserStoryCard = React.memo<SearchUserStoryCardProps>(
  ({ item, onPress }) => {
    const { colors } = useTheme();
    const { moderateScale } = useAuthLayout();

    const statusColor = getStatusThemeColor(item.status, colors);
    const priorityColor = getPriorityThemeColor(item.priority, colors);

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
        {/* Header Row: Story Key & Project Name */}
        <View className='flex-row items-center justify-between'>
          <View
            className='mr-2 flex-1 flex-row items-center'
            style={{ gap: moderateScale(6) }}
          >
            {item.key && (
              <View
                className='flex-row items-center'
                style={{
                  backgroundColor: '#10B98118',
                  borderRadius: Radius.sm,
                  paddingHorizontal: moderateScale(7),
                  paddingVertical: moderateScale(2),
                  gap: moderateScale(4),
                }}
              >
                <Ionicons
                  name='bookmark'
                  size={moderateScale(11)}
                  color='#10B981'
                />
                <AppText
                  variant='caption'
                  style={{
                    fontSize: moderateScale(11),
                    fontWeight: '700',
                    color: '#10B981',
                  }}
                >
                  {item.key}
                </AppText>
              </View>
            )}

            {item.project_name && (
              <View
                className='flex-1 flex-row items-center'
                style={{ gap: moderateScale(4) }}
              >
                <Ionicons
                  name='folder-outline'
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
                  {item.project_name}
                </AppText>
              </View>
            )}
          </View>

          <Ionicons
            name='chevron-forward'
            size={moderateScale(14)}
            color={colors.textSecondary}
          />
        </View>

        {/* Title */}
        <AppText
          variant='bodyLarge'
          className='font-semibold'
          color={colors.text}
          numberOfLines={2}
          style={{
            fontSize: moderateScale(14),
            lineHeight: moderateScale(19),
            marginVertical: moderateScale(8),
          }}
        >
          {item.title || 'Untitled User Story'}
        </AppText>

        {/* Footer Badges: Status and Priority */}
        <View
          className='flex-row items-center'
          style={{ gap: moderateScale(8) }}
        >
          {item.status && (
            <View
              className='flex-row items-center'
              style={{
                backgroundColor: `${statusColor}18`,
                borderRadius: Radius.pill,
                paddingHorizontal: moderateScale(8),
                paddingVertical: moderateScale(3),
                gap: moderateScale(4),
              }}
            >
              <View
                style={{
                  width: moderateScale(6),
                  height: moderateScale(6),
                  borderRadius: Radius.circle,
                  backgroundColor: statusColor,
                }}
              />
              <AppText
                variant='caption'
                style={{
                  fontSize: moderateScale(10),
                  fontWeight: '600',
                  color: statusColor,
                }}
              >
                {getStatusLabel(item.status)}
              </AppText>
            </View>
          )}

          {item.priority && (
            <View
              className='flex-row items-center'
              style={{
                backgroundColor: `${priorityColor}18`,
                borderRadius: Radius.pill,
                paddingHorizontal: moderateScale(8),
                paddingVertical: moderateScale(3),
                gap: moderateScale(4),
              }}
            >
              <Ionicons
                name='flag'
                size={moderateScale(10)}
                color={priorityColor}
              />
              <AppText
                variant='caption'
                style={{
                  fontSize: moderateScale(10),
                  fontWeight: '600',
                  color: priorityColor,
                }}
              >
                {getPriorityLabel(item.priority)}
              </AppText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  },
);
