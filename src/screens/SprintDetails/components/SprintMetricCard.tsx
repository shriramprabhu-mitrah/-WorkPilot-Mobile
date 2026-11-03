import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { AppText } from '../../../components';
import { useResponsive } from '../../../utils/responsive';
import { SprintMetricCardProps, withOpacity } from '../../../utils/sprintUtil';
import { WorkItemIcon } from '../../../components/common/getWorkItemIcon';

const SprintMetricCard: React.FC<SprintMetricCardProps> = ({
  type,
  count,
  label,
  onPress,
  colors,
}) => {
  const { moderateScale } = useResponsive();

  const config = {
    stories: {
      bgColor: colors.card,
      borderColor: withOpacity(colors.primary, 0.3),
      waveColor: withOpacity(colors.primary, 0.18),
      iconBg: withOpacity(colors.primary, 0.25),
      chevronColor: colors.textSecondary,
      renderIcon: () => <WorkItemIcon type='story' color={colors.primary} />,
    },
    storyless: {
      bgColor: colors.card,
      borderColor: withOpacity(colors.success, 0.3),
      waveColor: withOpacity(colors.success, 0.18),
      iconBg: withOpacity(colors.success, 0.25),
      chevronColor: colors.textSecondary,
      renderIcon: () => (
        <Svg width={20} height={20} viewBox='0 0 20 20'>
          <Circle cx={10} cy={10} r={9} fill={colors.success} />
          <Path
            d='M6 10L8.8 13L14 7'
            stroke='#FFFFFF'
            strokeWidth={2}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </Svg>
      ),
    },
    high_priority: {
      bgColor: colors.card,
      borderColor: withOpacity(colors.error, 0.3),
      waveColor: withOpacity(colors.error, 0.18),
      iconBg: withOpacity(colors.error, 0.25),
      chevronColor: colors.textSecondary,
      renderIcon: () => <WorkItemIcon type='flame' size={moderateScale(19)} />,
    },
  }[type];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: config.bgColor,
        borderRadius: moderateScale(22),
        padding: moderateScale(14),
        overflow: 'hidden',
        position: 'relative',
        minHeight: moderateScale(116),
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: config.borderColor,
      }}
    >
      <Svg
        width={moderateScale(55)}
        height={moderateScale(42)}
        viewBox='0 0 55 42'
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
        }}
      >
        <Path
          d='M0,42 C18,36 32,22 36,0 L55,0 L55,42 Z'
          fill={config.waveColor}
        />
      </Svg>
      <View
        style={{
          width: moderateScale(36),
          height: moderateScale(36),
          borderRadius: moderateScale(12),
          backgroundColor: config.iconBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {config.renderIcon()}
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: moderateScale(8),
        }}
      >
        <View>
          <AppText
            variant='h2'
            style={{
              fontSize: moderateScale(22),
              fontWeight: '800',
              color: colors.text,
            }}
          >
            {count}
          </AppText>
          <AppText
            variant='caption'
            style={{
              fontSize: moderateScale(12.5),
              fontWeight: '600',
              color: colors.textSecondary,
              marginTop: moderateScale(1),
            }}
          >
            {label}
          </AppText>
        </View>
        <WorkItemIcon
          type='chevron-right'
          size={moderateScale(17)}
          color={config.chevronColor}
        />
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(SprintMetricCard);
