import React from 'react';
import { Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-worklets';

import { BoardCard as BoardCardType } from '../types/projectBoard.type';
import AppText from './common/AppText';

interface Props {
  card: BoardCardType;
  onPress?: () => void;

  onDragStart?: (card: BoardCardType, x: number, y: number) => void;

  onDrag?: (card: BoardCardType, x: number, y: number) => void;

  onDragEnd?: (card: BoardCardType, x: number, y: number) => void;

  isDragging?: boolean;
}

const BoardCard = ({
  card,
  onPress,
  onDragStart,
  onDrag,
  onDragEnd,
  isDragging = false,
}: Props) => {
  const gesture = Gesture.Pan()
    .activateAfterLongPress(250)

    .onStart(event => {
      if (onDragStart) {
        runOnJS(onDragStart)(card, event.absoluteX, event.absoluteY);
      }
    })

    .onUpdate(event => {
      if (onDrag) {
        runOnJS(onDrag)(card, event.absoluteX, event.absoluteY);
      }
    })

    .onEnd(event => {
      if (onDragEnd) {
        runOnJS(onDragEnd)(card, event.absoluteX, event.absoluteY);
      }
    });

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={{
          opacity: isDragging ? 0 : 1,
        }}
      >
        <Pressable onPress={onPress} className='mb-3 rounded-xl bg-white p-4'>
          <AppText variant='body'>{card.title}</AppText>

          {card.description && (
            <View className='mt-2'>
              <AppText variant='body'>{card.description}</AppText>
            </View>
          )}

          {card.priority && (
            <View className='mt-3 self-start rounded-md bg-gray-100 px-2 py-1'>
              <AppText variant='body'>{card.priority}</AppText>
            </View>
          )}

          {card.assignee && (
            <View className='mt-3'>
              <AppText variant='body'>{card.assignee.name}</AppText>
            </View>
          )}
        </Pressable>
      </View>
    </GestureDetector>
  );
};

export default BoardCard;
