import React, { useState, useCallback, useMemo } from 'react';
import { View, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@react-native-vector-icons/ionicons';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import { CommonHeader } from '../components/common/CommonHeader';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useGetFavouritesQuery } from '../store/api/homeApi';
import { FavoriteItem } from '../types/projectBoard.type';
import { RootStackParamList } from '../types/navigationTypes';
import { WorkItemIcon } from '../components/common/getWorkItemIcon';
import ListSkeleton from '../components/skeleton/ListSkeleton';
import ProjectCardSkeleton from '../components/skeleton/ProjectCardSkeleton';

const Favorites = () => {
  const { colors } = useTheme();
  const { layout, hp, moderateScale } = useAuthLayout();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [page, setPage] = useState(1);

  const {
    data: favoritesData,
    isLoading,
    isFetching,
  } = useGetFavouritesQuery({
    page,
  });

  const items = useMemo(
    () => favoritesData?.data?.favorites ?? [],
    [favoritesData],
  );

  const meta = useMemo(() => favoritesData?.meta ?? null, [favoritesData]);

  const handleLoadMore = useCallback(() => {
    if (isFetching) return;
    if (items.length === 0) return;
    const hasNext =
      meta?.has_next !== undefined
        ? meta.has_next
        : meta?.total_pages !== undefined
          ? page < meta.total_pages
          : false;
    if (!hasNext) return;
    setPage(prev => prev + 1);
  }, [isFetching, items.length, meta, page]);

  const handleItemPress = useCallback(
    (item: FavoriteItem) => {
      if (item.item_type === 'task') {
        const taskId = (item as any).task_id || item.id;
        const userStoryId = (item as any).user_story_id;
        navigation.navigate('issue', {
          projectId: item.project_id,
          userStoryId: userStoryId,
          taskId,
          task: item as any,
          taskName: item.task_title || item.title,
        });
      } else if (item.item_type === 'user_story') {
        const userStoryId = (item as any).user_story_id || item.id;
        navigation.navigate('issue', {
          projectId: item.project_id,
          userStoryId,
          story: item as any,
          storyName: item.user_story_title || item.title,
        });
      }
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: FavoriteItem }) => {
      console.log('LINE79', item);
      const title =
        item.item_type === 'task'
          ? item.task_title || item.title
          : item.user_story_title || item.title;
      const subtitle = item.project_name;
      const type = item.item_type;

      return (
        <TouchableOpacity
          activeOpacity={0.8}
          className='mb-3 rounded-2xl border p-4'
          style={{
            backgroundColor: colors.background,
            borderColor: colors.border,
          }}
          onPress={() => handleItemPress(item)}
        >
          <View className='flex-row items-center'>
            <View
              className='mr-3.5 items-center justify-center rounded-lg'
              style={{
                width: moderateScale(30),
                height: moderateScale(30),
                backgroundColor: colors.surface,
              }}
            >
              <WorkItemIcon type={type} size={moderateScale(20)} />
            </View>
            <View className='flex-1 justify-center'>
              <AppText
                variant='body'
                className='font-bold capitalize'
                color={colors.text}
                style={{
                  fontSize: moderateScale(15),
                  lineHeight: moderateScale(20),
                  marginBottom: 2,
                }}
                numberOfLines={1}
              >
                {title}
              </AppText>
              <View className='flex-row items-center' style={{ gap: 4 }}>
                <AppText
                  variant='caption'
                  className='font-medium capitalize'
                  color={colors.textSecondary}
                  style={{ fontSize: moderateScale(11) }}
                >
                  {subtitle}
                </AppText>
              </View>
            </View>
            <Ionicons
              name='chevron-forward'
              size={moderateScale(16)}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>
      );
    },
    [colors, handleItemPress, moderateScale],
  );

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='custom'
        title='Favorites'
        titleAlignment='left'
        onBackPress={() => navigation.goBack()}
      />

      {isLoading && items.length === 0 ? (
        <View style={{ paddingHorizontal: layout.paddingHorizontal }}>
          <ListSkeleton
            count={5}
            containerStyle={{ gap: layout.elementGap }}
            renderItem={() => <ProjectCardSkeleton />}
          />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, index) =>
            item.id?.toString() || `favorite-${index}`
          }
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingBottom: hp(20),
            flexGrow: items.length === 0 ? 1 : undefined,
          }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.2}
          ListFooterComponent={
            isFetching && items.length > 0 ? (
              <View className='py-2'>
                <ProjectCardSkeleton />
              </View>
            ) : null
          }
        />
      )}
    </Screen>
  );
};

export default Favorites;
