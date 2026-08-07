import { Skeleton } from '@rneui/themed';
import { View } from 'react-native';
import { moderateScale } from '../../utils/responsive';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuthLayout } from '../../hooks/useAuthLayout';

const NotificationCardSkeleton = () => {
  const { colors } = useTheme();
  const { layout } = useAuthLayout();
  return (
    <View
      className='flex-row items-start'
      style={{
        paddingHorizontal: layout.paddingHorizontal,
        paddingVertical: layout.largeSectionGap,
        borderBottomWidth: 2,
        borderBottomColor: colors.itemDivider || colors.border,
        gap: layout.largeSectionGap,
      }}
    >
      {/* Left */}
      <View className='flex-row items-center'>
        <Skeleton
          animation='wave'
          circle
          width={moderateScale(8)}
          height={moderateScale(8)}
        />

        <View style={{ marginLeft: moderateScale(12) }}>
          <Skeleton
            animation='wave'
            circle
            width={moderateScale(48)}
            height={moderateScale(48)}
          />
        </View>
      </View>

      {/* Right */}
      <View className='flex-1'>
        <Skeleton animation='wave' width='95%' height={16} />

        <Skeleton
          animation='wave'
          width='80%'
          height={14}
          style={{ marginTop: 8 }}
        />

        <Skeleton
          animation='wave'
          width='35%'
          height={12}
          style={{ marginTop: 8 }}
        />
      </View>
    </View>
  );
};

export default NotificationCardSkeleton;
