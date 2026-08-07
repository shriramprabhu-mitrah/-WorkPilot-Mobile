import { Skeleton } from '@rneui/themed';
import { moderateScale } from '../../utils/responsive';
import { useTheme } from '../../theme/ThemeProvider';
import { View } from 'react-native';

const ProjectCardSkeleton = () => {
  const { colors } = useTheme();
  return (
    <View
      className='rounded-xl border p-3'
      style={{
        borderColor: colors.border,
        backgroundColor: colors.background,
      }}
    >
      <View className='flex-row items-center'>
        <Skeleton
          animation='wave'
          circle
          width={moderateScale(36)}
          height={moderateScale(36)}
        />

        <View className='ml-3 flex-1'>
          <Skeleton animation='wave' width='80%' height={16} />
          <Skeleton
            animation='wave'
            width='40%'
            height={12}
            style={{ marginTop: 8 }}
          />
        </View>
      </View>
    </View>
  );
};
export default ProjectCardSkeleton;
