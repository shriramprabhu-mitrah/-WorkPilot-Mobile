import React from 'react';
import { View } from 'react-native';
import AppText from '../common/AppText';
import { useTheme } from '../../hooks/useTheme';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { SearchCardSkeleton } from './skeletons/SearchCardSkeleton';

interface SearchFooterProps {
  isPaginating: boolean;
  hasNext?: boolean;
  hasResults: boolean;
  debouncedQuery: string;
  isMemberCategory: boolean;
}

export const SearchFooter: React.FC<SearchFooterProps> = ({
  isPaginating,
  hasNext,
  hasResults,
  debouncedQuery,
  isMemberCategory,
}) => {
  const { colors } = useTheme();
  const { moderateScale } = useAuthLayout();

  if (isPaginating) {
    return (
      <View style={{ marginTop: moderateScale(4) }}>
        <SearchCardSkeleton key='page-skel-1' isMember={isMemberCategory} />
        <SearchCardSkeleton key='page-skel-2' isMember={isMemberCategory} />
      </View>
    );
  }

  if (!hasNext && hasResults && debouncedQuery) {
    return (
      <View className='items-center justify-center py-4'>
        <AppText
          variant='caption'
          color={colors.textSecondary}
          style={{ fontSize: moderateScale(11) }}
        >
          You've reached the end of results
        </AppText>
      </View>
    );
  }

  return null;
};
