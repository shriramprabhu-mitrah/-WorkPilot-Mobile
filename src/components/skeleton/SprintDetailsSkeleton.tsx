import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useResponsive } from '../../utils/responsive';
import { SkeletonBlock } from '../../utils/validations';
import Screen from '../common/ScreenWapper';

const SprintDetailsSkeleton = () => {
  const { colors } = useTheme();
  const { hp, wp, moderateScale } = useResponsive();

  const skeletonColor = colors.border;

  return (
    <Screen backgroundColor={colors.surface}>
      <View
        className='flex-1'
        style={{
          backgroundColor: colors.background,
          paddingHorizontal: wp(4),
          paddingTop: hp(2),
        }}
      >
        {/* Sprint Hero Skeleton */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: moderateScale(22),
            padding: moderateScale(18),
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {/* Back, Status, Edit and Delete */}
          <View className='flex-row items-center justify-between'>
            <View className='flex-row items-center'>
              <SkeletonBlock
                width={moderateScale(34)}
                height={moderateScale(34)}
                borderRadius={moderateScale(17)}
                backgroundColor={skeletonColor}
              />

              <View style={{ marginLeft: moderateScale(12) }}>
                <SkeletonBlock
                  width={moderateScale(75)}
                  height={moderateScale(24)}
                  borderRadius={20}
                  backgroundColor={skeletonColor}
                />
              </View>
            </View>

            <View className='flex-row items-center'>
              <SkeletonBlock
                width={moderateScale(34)}
                height={moderateScale(34)}
                borderRadius={moderateScale(17)}
                backgroundColor={skeletonColor}
              />

              <View style={{ marginLeft: moderateScale(8) }}>
                <SkeletonBlock
                  width={moderateScale(34)}
                  height={moderateScale(34)}
                  borderRadius={moderateScale(17)}
                  backgroundColor={skeletonColor}
                />
              </View>
            </View>
          </View>

          {/* Sprint Name */}
          <View style={{ marginTop: moderateScale(20) }}>
            <SkeletonBlock
              width='75%'
              height={moderateScale(26)}
              backgroundColor={skeletonColor}
            />
          </View>

          {/* Sprint Dates */}
          <View style={{ marginTop: moderateScale(14) }}>
            <SkeletonBlock
              width='60%'
              height={moderateScale(16)}
              backgroundColor={skeletonColor}
            />
          </View>

          {/* Progress Bar */}
          <View style={{ marginTop: moderateScale(20) }}>
            <SkeletonBlock
              width='100%'
              height={moderateScale(8)}
              borderRadius={20}
              backgroundColor={skeletonColor}
            />
          </View>

          <View className='mt-3 flex-row items-center justify-between'>
            <SkeletonBlock
              width={moderateScale(90)}
              height={moderateScale(13)}
              backgroundColor={skeletonColor}
            />

            <SkeletonBlock
              width={moderateScale(75)}
              height={moderateScale(13)}
              backgroundColor={skeletonColor}
            />
          </View>
        </View>

        {/* Statistics Skeleton */}
        <View
          className='flex-row'
          style={{
            marginTop: moderateScale(14),
            gap: moderateScale(10),
          }}
        >
          {[1, 2, 3].map(item => (
            <View
              key={item}
              className='flex-1 items-center justify-center rounded-2xl'
              style={{
                backgroundColor: colors.card,
                paddingVertical: moderateScale(18),
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <SkeletonBlock
                width={moderateScale(22)}
                height={moderateScale(22)}
                borderRadius={6}
                backgroundColor={skeletonColor}
              />

              <View style={{ marginTop: moderateScale(10) }}>
                <SkeletonBlock
                  width={moderateScale(35)}
                  height={moderateScale(20)}
                  backgroundColor={skeletonColor}
                />
              </View>

              <View style={{ marginTop: moderateScale(8) }}>
                <SkeletonBlock
                  width={moderateScale(65)}
                  height={moderateScale(12)}
                  backgroundColor={skeletonColor}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Sprint Goal Skeleton */}
        <View
          className='flex-row items-start rounded-2xl'
          style={{
            marginTop: moderateScale(14),
            padding: moderateScale(14),
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <SkeletonBlock
            width={moderateScale(36)}
            height={moderateScale(36)}
            borderRadius={12}
            backgroundColor={skeletonColor}
          />

          <View className='ml-3 flex-1'>
            <SkeletonBlock
              width={moderateScale(90)}
              height={moderateScale(12)}
              backgroundColor={skeletonColor}
            />

            <View style={{ marginTop: moderateScale(10) }}>
              <SkeletonBlock
                width='90%'
                height={moderateScale(15)}
                backgroundColor={skeletonColor}
              />
            </View>
          </View>
        </View>

        {/* User Stories Header */}
        <View
          className='flex-row items-center justify-between'
          style={{
            marginTop: moderateScale(24),
            marginBottom: moderateScale(14),
          }}
        >
          <SkeletonBlock
            width={moderateScale(115)}
            height={moderateScale(20)}
            backgroundColor={skeletonColor}
          />

          <SkeletonBlock
            width={moderateScale(75)}
            height={moderateScale(16)}
            backgroundColor={skeletonColor}
          />
        </View>

        {/* User Story Cards */}
        {[1, 2, 3].map(item => (
          <View
            key={item}
            className='rounded-2xl border'
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              padding: moderateScale(14),
              marginBottom: moderateScale(12),
            }}
          >
            {/* Story ID */}
            <View className='flex-row items-center'>
              <SkeletonBlock
                width={moderateScale(20)}
                height={moderateScale(20)}
                backgroundColor={skeletonColor}
                borderRadius={5}
              />

              <View style={{ marginLeft: moderateScale(10) }}>
                <SkeletonBlock
                  width={moderateScale(85)}
                  height={moderateScale(20)}
                  backgroundColor={skeletonColor}
                />
              </View>
            </View>

            {/* Story Title */}
            <View style={{ marginTop: moderateScale(14) }}>
              <SkeletonBlock
                width='85%'
                height={moderateScale(16)}
                backgroundColor={skeletonColor}
              />
            </View>

            <View style={{ marginTop: moderateScale(8) }}>
              <SkeletonBlock
                width='60%'
                height={moderateScale(16)}
                backgroundColor={skeletonColor}
              />
            </View>

            {/* Story Meta */}
            <View
              className='flex-row items-center'
              style={{
                marginTop: moderateScale(16),
                gap: moderateScale(8),
              }}
            >
              <SkeletonBlock
                width={moderateScale(75)}
                height={moderateScale(24)}
                borderRadius={20}
                backgroundColor={skeletonColor}
              />

              <SkeletonBlock
                width={moderateScale(70)}
                height={moderateScale(24)}
                borderRadius={20}
                backgroundColor={skeletonColor}
              />

              <SkeletonBlock
                width={moderateScale(80)}
                height={moderateScale(24)}
                borderRadius={20}
                backgroundColor={skeletonColor}
              />
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
};

export default SprintDetailsSkeleton;
