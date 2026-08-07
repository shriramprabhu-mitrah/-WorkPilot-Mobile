import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@rneui/themed';
import { moderateScale } from '../../utils/responsive';

interface MyIssuesSkeletonProps {
  count?: number;
}

const MyIssuesSkeleton = ({ count = 5 }: MyIssuesSkeletonProps) => {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          className='mb-3 flex-row items-start rounded-xl border p-3.5'
          style={{
            borderColor: '#E5E7EB',
          }}
        >
          {/* Left */}
          <View className='mr-3 mt-0.5 flex-row items-center gap-2'>
            <Skeleton
              animation='wave'
              circle
              width={moderateScale(28)}
              height={moderateScale(28)}
            />

            <Skeleton
              animation='wave'
              circle
              width={moderateScale(8)}
              height={moderateScale(8)}
            />
          </View>

          {/* Content */}
          <View className='flex-1'>
            <Skeleton animation='wave' width='95%' height={moderateScale(16)} />

            <Skeleton
              animation='wave'
              width='70%'
              height={moderateScale(16)}
              style={{ marginTop: moderateScale(6) }}
            />

            <View
              className='flex-row items-center'
              style={{ marginTop: moderateScale(10) }}
            >
              <Skeleton
                animation='wave'
                width={moderateScale(55)}
                height={moderateScale(12)}
              />

              <Skeleton
                animation='wave'
                circle
                width={moderateScale(4)}
                height={moderateScale(4)}
                style={{ marginHorizontal: moderateScale(8) }}
              />

              <Skeleton
                animation='wave'
                width={moderateScale(70)}
                height={moderateScale(22)}
                style={{ borderRadius: 20 }}
              />
            </View>
          </View>

          <Skeleton
            animation='wave'
            width={moderateScale(18)}
            height={moderateScale(18)}
            style={{ marginLeft: moderateScale(12) }}
          />
        </View>
      ))}
    </View>
  );
};

export default MyIssuesSkeleton;
