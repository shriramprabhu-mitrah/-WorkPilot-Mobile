import React from 'react';
import { View } from 'react-native';
import AppText from '../common/AppText';
import { useTheme } from '../../hooks/useTheme';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { SearchInitialSkeleton } from './skeletons/SearchInitialSkeleton';
import Ionicons from '@react-native-vector-icons/ionicons';

interface SearchEmptyStateProps {
  isInitialLoading: boolean;
  debouncedQuery: string;
}

export const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({
  isInitialLoading,
  debouncedQuery,
}) => {
  const { colors } = useTheme();
  const { moderateScale } = useAuthLayout();

  if (isInitialLoading) {
    return <SearchInitialSkeleton />;
  }

  if (debouncedQuery.length > 0) {
    return (
      <View
        className='items-center justify-center px-6 py-16'
        style={{ gap: moderateScale(8) }}
      >
        <View
          className='items-center justify-center rounded-full'
          style={{
            width: moderateScale(60),
            height: moderateScale(60),
            backgroundColor: colors.surface,
          }}
        >
          <Ionicons
            name='search-outline'
            size={moderateScale(32)}
            color={colors.textSecondary}
          />
        </View>
        <AppText
          variant='bodyLarge'
          className='font-bold'
          color={colors.text}
          style={{ fontSize: moderateScale(16), marginTop: moderateScale(8) }}
        >
          No results found
        </AppText>
        <AppText
          variant='caption'
          color={colors.textSecondary}
          className='text-center'
          style={{ fontSize: moderateScale(12) }}
        >
          No matches found for "{debouncedQuery}". Try another keyword or
          category filter.
        </AppText>
      </View>
    );
  }

  return (
    <View
      className='items-center justify-center px-6 py-20'
      style={{ gap: moderateScale(8) }}
    >
      <View
        className='items-center justify-center rounded-full'
        style={{
          width: moderateScale(64),
          height: moderateScale(64),
          backgroundColor: colors.surface,
        }}
      >
        <Ionicons
          name='search-outline'
          size={moderateScale(32)}
          color={colors.textSecondary}
        />
      </View>
      <AppText
        variant='bodyLarge'
        className='font-semibold'
        color={colors.text}
        style={{ fontSize: moderateScale(16), marginTop: moderateScale(8) }}
      >
        Search WorkPilot
      </AppText>
      <AppText
        variant='caption'
        color={colors.textSecondary}
        className='text-center'
        style={{ fontSize: moderateScale(12) }}
      >
        Quickly find tasks, user stories, projects, team members, and sprints
      </AppText>
    </View>
  );
};
