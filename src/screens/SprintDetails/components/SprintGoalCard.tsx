import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Ionicons from '@react-native-vector-icons/ionicons';
import { AppText } from '../../../components';
import { useResponsive } from '../../../utils/responsive';
import { cleanHtmlText, SprintGoalCardProps } from '../../../utils/sprintUtil';

const SprintGoalCard: React.FC<SprintGoalCardProps> = ({
  goal,
  canEdit,
  onPress,
  colors,
}) => {
  const { moderateScale } = useResponsive();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={!canEdit}
      onPress={onPress}
      style={{
        marginTop: moderateScale(14),
        backgroundColor: colors.card,
        borderRadius: moderateScale(22),
        padding: moderateScale(16),
        overflow: 'hidden',
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.accentPurple + 35,
      }}
    >
      <Svg
        width={moderateScale(75)}
        height={moderateScale(55)}
        viewBox='0 0 75 55'
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
        }}
      >
        <Path
          d='M0,55 C25,48 45,30 50,0 L75,0 L75,55 Z'
          fill={colors.accentPurple + 35}
        />
      </Svg>
      <View
        style={{
          width: moderateScale(48),
          height: moderateScale(48),
          borderRadius: moderateScale(16),
          backgroundColor: colors.card,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: moderateScale(14),
        }}
      >
        <Svg
          width={moderateScale(28)}
          height={moderateScale(28)}
          viewBox='0 0 28 28'
        >
          <Circle
            cx={14}
            cy={14}
            r={11}
            stroke={colors.accentPurple}
            strokeWidth={2.2}
            fill='none'
          />
          <Circle
            cx={14}
            cy={14}
            r={6.5}
            stroke={colors.accentPurple}
            strokeWidth={2.2}
            fill='none'
          />
          <Circle cx={14} cy={14} r={2.5} fill={colors.accentPurple} />
          <Path
            d='M21 7L14 14'
            stroke={colors.accentPurple}
            strokeWidth={2.2}
            strokeLinecap='round'
          />
          <Path d='M23 3L25 5L22 8L20 6Z' fill={colors.accentPurple} />
        </Svg>
      </View>
      <View style={{ flex: 1, marginRight: moderateScale(8) }}>
        <AppText
          variant='body'
          style={{
            fontSize: moderateScale(15),
            fontWeight: '700',
            color: colors.text,
          }}
        >
          Sprint Goal
        </AppText>
        <AppText
          variant='caption'
          numberOfLines={2}
          style={{
            fontSize: moderateScale(12.5),
            color: colors.textSecondary,
            marginTop: moderateScale(3),
            lineHeight: moderateScale(17),
          }}
        >
          {cleanHtmlText(goal) || 'Set goal for this sprint.'}
        </AppText>
      </View>
      <Ionicons
        name='chevron-forward'
        size={moderateScale(18)}
        color={colors.text}
      />
    </TouchableOpacity>
  );
};

export default React.memo(SprintGoalCard);
