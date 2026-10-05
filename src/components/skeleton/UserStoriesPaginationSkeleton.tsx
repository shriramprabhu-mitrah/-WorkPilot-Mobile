import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useResponsive } from '../../utils/responsive';
import { SkeletonBlock } from '../../utils/validations';

const UserStoriesPaginationSkeleton = () => {
  const { colors } = useTheme();
  const { moderateScale } = useResponsive();

  return (
    <View>
      {[1, 2, 3].map(item => (
        <View
          key={item}
          className='mb-3 flex-row overflow-hidden rounded-2xl border'
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            padding: moderateScale(14),
          }}
        >
          <View className='flex-1'>
            {/* Story key */}
            <SkeletonBlock
              width={80}
              height={18}
              borderRadius={5}
              backgroundColor={colors.border}
            />

            {/* Story title */}
            <View style={{ marginTop: moderateScale(12) }}>
              <SkeletonBlock
                width='85%'
                height={16}
                backgroundColor={colors.border}
              />
            </View>

            {/* Story description */}
            <View style={{ marginTop: moderateScale(8) }}>
              <SkeletonBlock
                width='65%'
                height={12}
                backgroundColor={colors.border}
              />
            </View>

            {/* Metadata chips */}
            <View
              className='flex-row'
              style={{
                marginTop: moderateScale(14),
                gap: moderateScale(8),
              }}
            >
              <SkeletonBlock
                width={75}
                height={24}
                borderRadius={12}
                backgroundColor={colors.border}
              />
              <SkeletonBlock
                width={80}
                height={24}
                borderRadius={12}
                backgroundColor={colors.border}
              />
              <SkeletonBlock
                width={70}
                height={24}
                borderRadius={12}
                backgroundColor={colors.border}
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default UserStoriesPaginationSkeleton;
