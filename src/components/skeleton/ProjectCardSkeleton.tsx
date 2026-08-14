import { Skeleton } from '@rneui/themed';
import { moderateScale } from '../../utils/responsive';
import { useTheme } from '../../theme/ThemeProvider';
import { View } from 'react-native';
import { Radius } from '../../constants/Radius';

const ProjectCardSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View
      className='flex-row items-center border p-3.5'
      style={{
        borderColor: colors.border,
        backgroundColor: colors.background,
        borderRadius: Radius?.md,
        gap: 12,
      }}
    >
      <Skeleton
        animation='wave'
        width={moderateScale(44)}
        height={moderateScale(44)}
        style={{
          borderRadius: Radius?.sm || 8,
          backgroundColor: colors.background,
        }}
      />
      <View className='flex-1 justify-center' style={{ gap: 6 }}>
        <Skeleton
          animation='wave'
          width='55%'
          height={16}
          style={{
            borderRadius: Radius?.xs || 4,
            backgroundColor: colors.background,
          }}
        />
        <Skeleton
          animation='wave'
          width='75%'
          height={12}
          style={{
            borderRadius: Radius?.xs || 4,
            backgroundColor: colors.background,
          }}
        />
      </View>

      <View className='flex-row items-center' style={{ gap: 10 }}>
        <View className='items-end justify-center' style={{ gap: 6 }}>
          <Skeleton
            animation='wave'
            width={65}
            height={12}
            style={{
              borderRadius: Radius?.xs || 4,
              backgroundColor: colors.background,
            }}
          />
          <Skeleton
            animation='wave'
            width={45}
            height={10}
            style={{
              borderRadius: Radius?.xs || 4,
              backgroundColor: colors.background,
            }}
          />
        </View>
        <Skeleton
          animation='wave'
          width={58}
          height={22}
          style={{
            borderRadius: 12,
            backgroundColor: colors.background,
          }}
        />
      </View>
    </View>
  );
};

export default ProjectCardSkeleton;
