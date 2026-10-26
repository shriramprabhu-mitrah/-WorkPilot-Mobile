import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import AppText from '../../common/AppText';
import { useTheme } from '../../../hooks/useTheme';
import { useAuthLayout } from '../../../hooks/useAuthLayout';
import { SearchItem } from '../../../types/home.type';
import { getStatusThemeColor } from '../../../utils/enum';
import { renderParsedHtml } from '../../../utils/htmlParser';
import { Radius } from '../../../constants/Radius';
import Ionicons from '@react-native-vector-icons/ionicons';

interface SearchSprintCardProps {
  item: SearchItem;
  onPress: (item: SearchItem) => void;
}

export const SearchSprintCard = React.memo<SearchSprintCardProps>(
  ({ item, onPress }) => {
    const { colors } = useTheme();
    const { moderateScale } = useAuthLayout();

    const statusColor = getStatusThemeColor(item.status, colors);

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
          {/* Sprint Icon */}
          <View
            className='items-center justify-center'
            style={{
              width: moderateScale(42),
              height: moderateScale(42),
              borderRadius: Radius.md,
              backgroundColor: '#F59E0B18',
            }}
          >
            <Ionicons name='repeat' size={moderateScale(22)} color='#F59E0B' />
          </View>

          {/* Title & Project Name */}
          <View
            className='flex-1 justify-center'
            style={{ marginLeft: moderateScale(12) }}
          >
            <AppText
              variant='bodyLarge'
              className='font-bold'
              color={colors.text}
              numberOfLines={1}
              style={{ fontSize: moderateScale(15) }}
            >
              {item.title || item.name || 'Untitled Sprint'}
            </AppText>

            {item.project_name && (
              <View
                className='flex-row items-center'
                style={{
                  marginTop: moderateScale(2),
                  gap: moderateScale(4),
                }}
              >
                <Ionicons
                  name='folder-outline'
                  size={moderateScale(11)}
                  color={colors.textSecondary}
                />
                <AppText
                  variant='caption'
                  color={colors.textSecondary}
                  numberOfLines={1}
                  style={{ fontSize: moderateScale(11) }}
                >
                  {item.project_name}
                </AppText>
              </View>
            )}
          </View>

          {/* Status Badge */}
          {item.status && (
            <View
              style={{
                backgroundColor: `${statusColor}18`,
                borderRadius: Radius.sm,
                paddingHorizontal: moderateScale(8),
                paddingVertical: moderateScale(3),
              }}
            >
              <AppText
                variant='caption'
                style={{
                  fontSize: moderateScale(10),
                  fontWeight: '700',
                  textTransform: 'capitalize',
                  color: statusColor,
                }}
              >
                {item.status.replace('_', ' ')}
              </AppText>
            </View>
          )}
        </View>

        {/* Action Link Footer */}
        <View
          className='flex-row items-center justify-between'
          style={{
            marginTop: moderateScale(10),
            paddingTop: moderateScale(8),
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <AppText
            variant='caption'
            style={{
              fontSize: moderateScale(11),
              fontWeight: '600',
              color: colors.primary,
            }}
          >
            Sprint Details
          </AppText>
          <Ionicons
            name='arrow-forward'
            size={moderateScale(12)}
            color={colors.primary}
          />
        </View>
      </TouchableOpacity>
    );
  },
);
