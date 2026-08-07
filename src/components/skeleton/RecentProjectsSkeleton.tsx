import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@rneui/themed';
import { moderateScale } from '../../utils/responsive';

const RecentProjectsSkeleton = () => {
  return (
    <View className='flex-row flex-wrap justify-between'>
      {Array.from({ length: 4 }).map((_, index) => (
        <View
          key={index}
          style={{
            width: '48.5%',
            marginBottom: moderateScale(12),
          }}
          className='rounded-xl border border-gray-200 p-3'
        >
          <View className='flex-row items-center'>
            {/* Avatar */}
            <Skeleton
              animation='wave'
              circle
              width={moderateScale(36)}
              height={moderateScale(36)}
            />

            {/* Title & Key */}
            <View className='ml-2 flex-1'>
              <Skeleton
                animation='wave'
                width='90%'
                height={moderateScale(16)}
                style={{ borderRadius: 4 }}
              />

              <Skeleton
                animation='wave'
                width='50%'
                height={moderateScale(12)}
                style={{
                  marginTop: moderateScale(8),
                  borderRadius: 4,
                }}
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

export default RecentProjectsSkeleton;
