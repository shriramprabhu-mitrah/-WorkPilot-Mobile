import React from 'react';
import { View } from 'react-native';
import { useAuthLayout } from '../../../hooks/useAuthLayout';
import { SearchCardSkeleton } from './SearchCardSkeleton';

export const SearchInitialSkeleton: React.FC = () => {
  const { moderateScale } = useAuthLayout();

  return (
    <View style={{ paddingTop: moderateScale(4) }}>
      <SearchCardSkeleton key='skel-1' isMember={false} />
      <SearchCardSkeleton key='skel-2' isMember={true} />
      <SearchCardSkeleton key='skel-3' isMember={false} />
      <SearchCardSkeleton key='skel-4' isMember={false} />
      <SearchCardSkeleton key='skel-5' isMember={true} />
    </View>
  );
};
