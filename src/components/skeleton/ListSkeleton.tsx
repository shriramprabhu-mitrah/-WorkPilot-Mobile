import React from 'react';
import { View } from 'react-native';

interface ListSkeletonProps {
  count?: number;
  renderItem: (index: number) => React.ReactNode;
  containerStyle?: object;
  WrapperComponent?: React.ComponentType<any>;
}

const ListSkeleton = ({
  count = 5,
  renderItem,
  containerStyle,
  WrapperComponent = View,
}: ListSkeletonProps) => {
  return (
    <WrapperComponent style={containerStyle}>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>{renderItem(index)}</React.Fragment>
      ))}
    </WrapperComponent>
  );
};

export default ListSkeleton;
