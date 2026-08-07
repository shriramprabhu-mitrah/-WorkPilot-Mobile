import React from 'react';
import { Skeleton } from '@rneui/themed';
import { View } from 'react-native';

interface Props {
  layout: any;
}

const SearchScreenSkeleton = ({ layout }: Props) => {
  return (
    <View
      style={{
        paddingHorizontal: layout.paddingHorizontal,
        paddingTop: layout.elementGap * 1.5,
      }}
    >
      {/* Recent Search Title */}
      <Skeleton
        width='45%'
        height={layout.titleFontSize}
        style={{
          marginBottom: layout.elementGap,
          borderRadius: layout.titleFontSize / 2,
        }}
      />

      {/* Recent Search Items */}
      {Array.from({ length: 3 }).map((_, index) => (
        <View
          key={index}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: layout.elementGap,
          }}
        >
          {/* Left Icon */}
          <Skeleton
            circle
            width={layout.iconSize * 0.75}
            height={layout.iconSize * 0.75}
          />

          {/* Text */}
          <View
            style={{
              flex: 1,
              marginLeft: layout.tightGap,
            }}
          >
            <Skeleton
              width='70%'
              height={layout.bodyFontSize}
              style={{
                borderRadius: layout.bodyFontSize / 2,
              }}
            />
          </View>

          {/* Right Arrow */}
          <Skeleton
            width={layout.iconSize * 0.7}
            height={layout.iconSize * 0.7}
            style={{
              borderRadius: layout.iconSize,
            }}
          />
        </View>
      ))}

      {/* Trending Title */}
      <Skeleton
        width='60%'
        height={layout.titleFontSize}
        style={{
          marginTop: layout.sectionGap,
          marginBottom: layout.elementGap,
          borderRadius: layout.titleFontSize / 2,
        }}
      />

      {/* Trending Items */}
      {Array.from({ length: 4 }).map((_, index) => (
        <View
          key={index}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: layout.elementGap,
            paddingVertical: layout.tightGap,
          }}
        >
          {/* Avatar */}
          <Skeleton
            width={layout.avatarSizeSmall}
            height={layout.avatarSizeSmall}
            style={{
              borderRadius: layout.borderRadiusSmall ?? 8,
            }}
          />

          {/* Text */}
          <View
            style={{
              flex: 1,
              marginLeft: layout.tightGap,
            }}
          >
            <Skeleton
              width='65%'
              height={layout.bodyFontSize}
              style={{
                borderRadius: layout.bodyFontSize / 2,
              }}
            />

            <Skeleton
              width='40%'
              height={layout.captionFontSize}
              style={{
                marginTop: layout.tightGap / 2,
                borderRadius: layout.captionFontSize / 2,
              }}
            />
          </View>

          {/* Arrow */}
          <Skeleton
            width={layout.iconSize * 0.7}
            height={layout.iconSize * 0.7}
            style={{
              borderRadius: layout.iconSize,
            }}
          />
        </View>
      ))}
    </View>
  );
};

export default SearchScreenSkeleton;
