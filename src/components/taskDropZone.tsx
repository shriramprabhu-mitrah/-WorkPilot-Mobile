import React, { useCallback, useEffect, useRef } from 'react';
import { View, FlatList } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { ColumnTaskState, DropZone } from '../types/project.type';
import { ThemeColors } from '../constants/Colors';
import { moderateScale } from '../utils/responsive';
import { SkeletonBox } from './skeleton/boardSkeleton';

type TaskDropZoneProps = {
  storyId: string;
  statusId: string;
  onRegister: (zone: DropZone) => void;
  isActive?: boolean;
  isSuccess?: boolean;
  children?: React.ReactNode;
  horizontalScrollOffset: SharedValue<number>;
  verticalScrollOffset: SharedValue<number>;
  expanded?: boolean;
  columnState?: ColumnTaskState;
  onLoadMoreTasks?: (storyId: string, statusId: string) => void;
  colors: ThemeColors;
};

export const TaskDropZone = ({
  storyId,
  statusId,
  onRegister,
  isActive,
  isSuccess,
  children,
  horizontalScrollOffset,
  verticalScrollOffset,
  colors,
  expanded,
  columnState,
  onLoadMoreTasks,
}: TaskDropZoneProps) => {
  const dropZoneRef = useRef<View>(null);

  const measureZone = useCallback(() => {
    if (!dropZoneRef.current) return;

    dropZoneRef.current.measureInWindow((x, y, width, height) => {
      if (width === 0 && height === 0) return;

      onRegister({
        storyId,
        statusId,
        x,
        y,
        width,
        height,
        scrollXAtMeasure: horizontalScrollOffset?.value ?? 0,
        scrollYAtMeasure: verticalScrollOffset?.value ?? 0,
      });
    });
  }, [
    storyId,
    statusId,
    onRegister,
    horizontalScrollOffset,
    verticalScrollOffset,
  ]);

  const loadedCount = columnState?.tasks?.length ?? 0;
  const totalCount = columnState?.totalCount ?? 0;
  const remainingCount = Math.max(0, totalCount - loadedCount);
  const canLoadMore =
    expanded &&
    Boolean(columnState?.hasNext) &&
    (remainingCount > 0 || columnState?.isLoading);
  const taskItems = React.Children.toArray(children).filter(
    (item): item is React.ReactElement => React.isValidElement(item),
  );
  const nextTriggerIndexRef = useRef<number | null>(null);
  const previousTaskCountRef = useRef(0);

  useEffect(() => {
    const currentTaskCount = taskItems.length;
    if (currentTaskCount === 0) {
      nextTriggerIndexRef.current = null;
      previousTaskCountRef.current = 0;
      return;
    }
    if (
      previousTaskCountRef.current === 0 ||
      nextTriggerIndexRef.current === null
    ) {
      nextTriggerIndexRef.current = Math.ceil(currentTaskCount * 0.5);
    }
    if (currentTaskCount > previousTaskCountRef.current) {
      nextTriggerIndexRef.current =
        previousTaskCountRef.current +
        Math.ceil((currentTaskCount - previousTaskCountRef.current) * 0.5);
    }
    previousTaskCountRef.current = currentTaskCount;
  }, [taskItems.length]);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: any[] }) => {
      const lastVisibleIndex =
        viewableItems[viewableItems.length - 1]?.index ?? -1;
      const nextTriggerIndex = nextTriggerIndexRef.current;
      if (nextTriggerIndex === null || !canLoadMore || columnState?.isLoading) {
        return;
      }
      const currentVisibleTask = lastVisibleIndex + 1;
      if (currentVisibleTask >= nextTriggerIndex) {
        onLoadMoreTasks?.(storyId, statusId);
      }
    },
    [canLoadMore, columnState?.isLoading, onLoadMoreTasks, storyId, statusId],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View
      ref={dropZoneRef}
      onLayout={measureZone}
      style={{
        width: moderateScale(260),
        height: expanded ? 270 : 100,
        padding: 8,
        borderLeftWidth: 1,
        borderLeftColor: colors.border,
        backgroundColor: isSuccess
          ? `${colors.success}30`
          : isActive
            ? colors.textOnPrimarySubtle
            : 'transparent',
      }}
    >
      {expanded ? (
        <FlatList
          data={taskItems}
          keyExtractor={(item, index) =>
            React.isValidElement(item) && item.key != null
              ? String(item.key)
              : String(index)
          }
          renderItem={({ item }) => item}
          nestedScrollEnabled
          showsVerticalScrollIndicator
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          style={{ flex: 1 }}
          contentContainerStyle={{
            gap: 8,
            paddingBottom: 4,
          }}
          ListFooterComponent={
            canLoadMore && columnState?.isLoading ? (
              <View
                style={{
                  width: '100%',
                  paddingVertical: 10,
                  gap: 8,
                }}
              >
                <SkeletonBox width='100%' height={56} borderRadius={8} />
              </View>
            ) : null
          }
        />
      ) : null}
    </View>
  );
};
