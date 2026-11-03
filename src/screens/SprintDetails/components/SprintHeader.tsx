import React from 'react';
import {
  ImageBackground,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { AppText } from '../../../components';
import { useResponsive } from '../../../utils/responsive';
import {
  SprintHeaderProps,
  SunsetHeaderImage,
  calculateStrokeDashoffset,
  formatSprintDates,
  withOpacity,
} from '../../../utils/sprintUtil';

const SprintHeader: React.FC<SprintHeaderProps> = ({
  sprint,
  progressPercent,
  daysLeft,
  permissionsReady,
  canEditSprint,
  canDeleteSprint,
  colors,
  onBack,
  onEditSprint,
  onOpenActionMenu,
}) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { wp, moderateScale } = useResponsive();
  const strokeDashoffset = calculateStrokeDashoffset(progressPercent);
  const formattedDates = formatSprintDates(sprint.startDate, sprint.endDate);

  return (
    <View
      style={{
        width: screenWidth,
        borderBottomLeftRadius: moderateScale(30),
        borderBottomRightRadius: moderateScale(30),
        overflow: 'hidden',
        backgroundColor: colors.background,
      }}
    >
      <ImageBackground
        source={SunsetHeaderImage}
        resizeMode='cover'
        fadeDuration={0}
        style={{
          width: screenWidth,
          paddingTop:
            insets.top > 0 ? insets.top + moderateScale(4) : moderateScale(14),
          paddingHorizontal: wp(4),
          paddingBottom: moderateScale(14),
        }}
        imageStyle={{
          width: screenWidth,
          borderBottomLeftRadius: moderateScale(30),
          borderBottomRightRadius: moderateScale(30),
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onBack}
              style={{
                width: moderateScale(38),
                height: moderateScale(38),
                borderRadius: moderateScale(19),
                backgroundColor: 'rgba(255, 255, 255, 0.22)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name='arrow-back'
                size={moderateScale(20)}
                color='#FFFFFF'
              />
            </TouchableOpacity>
            <AppText
              variant='h3'
              style={{
                marginLeft: moderateScale(14),
                fontSize: moderateScale(18),
                fontWeight: '700',
                color: '#FFFFFF',
              }}
            >
              Sprint Detail
            </AppText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {permissionsReady && canEditSprint && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onEditSprint}
                style={{
                  width: moderateScale(38),
                  height: moderateScale(38),
                  borderRadius: moderateScale(19),
                  backgroundColor: 'rgba(255, 255, 255, 0.22)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: moderateScale(8),
                }}
              >
                <Ionicons
                  name='pencil'
                  size={moderateScale(17)}
                  color='#FFFFFF'
                />
              </TouchableOpacity>
            )}
            {permissionsReady && (canEditSprint || canDeleteSprint) && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onOpenActionMenu}
                style={{
                  width: moderateScale(38),
                  height: moderateScale(38),
                  borderRadius: moderateScale(19),
                  backgroundColor: 'rgba(255, 255, 255, 0.22)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons
                  name='ellipsis-vertical'
                  size={moderateScale(18)}
                  color='#FFFFFF'
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: moderateScale(14),
          }}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary, colors.info]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: moderateScale(54),
              height: moderateScale(54),
              borderRadius: moderateScale(16),
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: moderateScale(10),
              elevation: 3,
              shadowColor: colors.success,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
          >
            <Ionicons name='rocket' size={moderateScale(28)} color='#FFFFFF' />
          </LinearGradient>
          <View
            style={{
              flex: 1,
              marginRight: moderateScale(8),
              justifyContent: 'center',
            }}
          >
            <AppText
              variant='h3'
              numberOfLines={1}
              style={{
                fontSize: moderateScale(18),
                fontWeight: '800',
                color: '#FFFFFF',
                marginTop: moderateScale(1),
              }}
            >
              {sprint.name}
            </AppText>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: moderateScale(3),
              }}
            >
              <Ionicons
                name='calendar-outline'
                size={moderateScale(12)}
                color='rgba(255, 255, 255, 0.85)'
              />
              <AppText
                variant='caption'
                numberOfLines={1}
                style={{
                  marginLeft: moderateScale(4),
                  fontSize: moderateScale(11),
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                {formattedDates}
              </AppText>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'flex-start',
                marginTop: moderateScale(5),
                backgroundColor: withOpacity('#14E8A8', 0.35),
                borderRadius: moderateScale(12),
                padding: moderateScale(4),
              }}
            >
              <View
                style={{
                  width: moderateScale(6),
                  height: moderateScale(6),
                  borderRadius: moderateScale(3),
                  backgroundColor: '#14E8A8',
                  marginRight: moderateScale(5),
                }}
              />
              <AppText
                variant='caption'
                style={{
                  fontSize: moderateScale(11),
                  fontWeight: '600',
                  color: '#14E8A8',
                  textTransform: 'capitalize',
                }}
              >
                {sprint.status}
              </AppText>
            </View>
          </View>
        </View>
        <View style={{ marginTop: moderateScale(14) }}>
          <View
            style={{
              height: moderateScale(7),
              borderRadius: moderateScale(4),
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${Math.min(100, Math.max(0, progressPercent))}%`,
                borderRadius: moderateScale(4),
                backgroundColor: '#14E8A8',
              }}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: moderateScale(6),
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Svg
                width={moderateScale(15)}
                height={moderateScale(15)}
                viewBox='0 0 30 30'
                style={{ marginRight: moderateScale(5) }}
              >
                <Circle
                  cx={15}
                  cy={15}
                  r={moderateScale(12)}
                  stroke='rgba(255, 255, 255, 0.25)'
                  strokeWidth={4}
                  fill='none'
                />
                <Circle
                  cx={15}
                  cy={15}
                  r={moderateScale(12)}
                  stroke={'#14E8A8'}
                  strokeWidth={4}
                  strokeDasharray={2 * Math.PI * moderateScale(12)}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap='round'
                  fill='none'
                  transform='rotate(-90 15 15)'
                />
              </Svg>
              <AppText
                variant='caption'
                style={{
                  fontSize: moderateScale(11),
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: '500',
                }}
              >
                {progressPercent}% completed
              </AppText>
            </View>
            <AppText
              variant='caption'
              style={{
                fontSize: moderateScale(11),
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: '500',
              }}
            >
              {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
            </AppText>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

export default React.memo(SprintHeader);
