import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { AppText } from '../../../components';
import SwipeableOption from '../../../components/SwipeableOption';
import { useResponsive } from '../../../utils/responsive';
import {
  withOpacity,
  getStatusColor,
  SprintItemCardProps,
} from '../../../utils/sprintUtil';
import { getPriorityThemeColor } from '../../../utils/enum';
import { WorkItemIcon } from '../../../components/common/getWorkItemIcon';

const SprintItemCard: React.FC<SprintItemCardProps> = ({
  item,
  isSelected = false,
  canDelete,
  colors,
  onPress,
  onToggleFavorite,
  onDelete,
  accentColor,
}) => {
  const { wp, moderateScale } = useResponsive();

  const priorityColor = getPriorityThemeColor(
    item.priority,
    colors.textSecondary,
  );
  const statusColor = getStatusColor(item.status, colors.textSecondary);

  return (
    <SwipeableOption
      enabled={canDelete}
      actionWidth={moderateScale(65)}
      actions={[
        {
          key: 'delete-item',
          icon: 'trash-outline',
          accessibilityLabel: 'Delete item',
          onPress: onDelete,
          width: moderateScale(65),
          iconSize: moderateScale(22),
        },
      ]}
      containerStyle={{
        marginHorizontal: wp(4),
        marginBottom: moderateScale(12),
        borderRadius: moderateScale(18),
        overflow: 'hidden',
      }}
      rightThreshold={40}
    >
      <View
        style={{
          borderRadius: moderateScale(18),
          backgroundColor: isSelected
            ? withOpacity(colors.primary, 0.16)
            : colors.card,
          borderWidth: 1,
          borderColor: isSelected ? colors.primary : colors.border,
          overflow: 'hidden',
          elevation: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 3,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onPress}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: moderateScale(4),
              alignSelf: 'stretch',
              backgroundColor: accentColor,
            }}
          />

          <View
            style={{
              flex: 1,
              paddingHorizontal: moderateScale(14),
              paddingVertical: moderateScale(12),
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: moderateScale(8),
                  backgroundColor: colors.surface,
                  borderRadius: moderateScale(6),
                  paddingHorizontal: moderateScale(8),
                  paddingVertical: moderateScale(2),
                }}
              >
                <WorkItemIcon
                  type={item.isStoryless ? 'Task' : 'userStory'}
                  size={16}
                />
                <AppText
                  variant='caption'
                  style={{
                    color: colors.textSecondary,
                    fontSize: moderateScale(11),
                    fontWeight: '700',
                  }}
                  numberOfLines={1}
                >
                  {item.key}
                </AppText>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={e => {
                  e.stopPropagation();
                  onToggleFavorite();
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{
                  padding: 4,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name={item.is_favourite ? 'star' : 'star-outline'}
                  size={moderateScale(18)}
                  color={item.is_favourite ? '#F59E0B' : colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <AppText
              variant='body'
              style={{
                marginTop: moderateScale(6),
                fontWeight: '700',
                color: colors.text,
                fontSize: moderateScale(14),
              }}
              numberOfLines={2}
            >
              {item.title || ''}
            </AppText>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginTop: moderateScale(10),
                gap: moderateScale(6),
              }}
            >
              <View
                style={{
                  borderRadius: moderateScale(12),
                  backgroundColor: colors.surface,
                  padding: moderateScale(6),
                }}
              >
                <AppText
                  variant='caption'
                  style={{
                    marginLeft: moderateScale(4),
                    color: colors.textSecondary,
                    fontSize: moderateScale(11),
                    fontWeight: '500',
                  }}
                >
                  {item.isStoryless
                    ? 'Storyless Task'
                    : `${item.total_tasks ?? 0} Tasks`}
                </AppText>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: moderateScale(12),
                  backgroundColor: withOpacity(
                    priorityColor,
                    isSelected ? 0.22 : 0.12,
                  ),
                  paddingHorizontal: moderateScale(8),
                  paddingVertical: moderateScale(3),
                }}
              >
                <Ionicons
                  name='flag'
                  size={moderateScale(11)}
                  color={priorityColor}
                />
                <AppText
                  variant='caption'
                  style={{
                    marginLeft: moderateScale(4),
                    color: priorityColor,
                    fontSize: moderateScale(11),
                    fontWeight: '600',
                    textTransform: 'capitalize',
                  }}
                >
                  {item.priority}
                </AppText>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: moderateScale(12),
                  backgroundColor: withOpacity(
                    statusColor,
                    isSelected ? 0.22 : 0.12,
                  ),
                  paddingHorizontal: moderateScale(8),
                  paddingVertical: moderateScale(3),
                }}
              >
                <View
                  style={{
                    width: moderateScale(6),
                    height: moderateScale(6),
                    borderRadius: moderateScale(3),
                    backgroundColor: statusColor,
                    marginRight: moderateScale(4),
                  }}
                />
                <AppText
                  variant='caption'
                  style={{
                    color: statusColor,
                    fontSize: moderateScale(11),
                    fontWeight: '600',
                    textTransform: 'capitalize',
                  }}
                >
                  {item.status}
                </AppText>
              </View>
            </View>
          </View>
          <View style={{ paddingRight: moderateScale(12) }}>
            <Ionicons
              name='chevron-forward'
              size={moderateScale(18)}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>
      </View>
    </SwipeableOption>
  );
};

export default React.memo(SprintItemCard);
