import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import BoardCard from './BoardCard';
import BoardColumnHeader from './BoardColumnHeader';

import {
  BoardColumn as BoardColumnType,
  BoardCard as BoardCardType,
} from '../types/projectBoard.type';

import AppText from './common/AppText';

interface Props {
  column: BoardColumnType;
  boardHeight?: number;

  onCardPress?: (cardId: string) => void;
  onAddCard?: (columnId: string) => void;

  onRename?: (columnId: string) => void;
  onMoveRight?: (columnId: string) => void;
  onDelete?: (columnId: string) => void;

  onDragStart?: (card: BoardCardType, x: number, y: number) => void;

  onDrag?: (card: BoardCardType, x: number, y: number) => void;

  onDragEnd?: (card: BoardCardType, x: number, y: number) => void;

  draggingCardId?: string | null;
}

const BoardColumn = ({
  column,
  boardHeight = 600,
  onCardPress,
  onAddCard,
  onRename,
  onMoveRight,
  onDelete,
  onDragStart,
  onDrag,
  onDragEnd,
  draggingCardId,
}: Props) => {
  return (
    <View
      className='w-[300px] rounded-xl bg-gray-100 p-3'
      style={{
        height: boardHeight,
      }}
    >
      <BoardColumnHeader
        title={column.title}
        count={column.cards.length}
        onRename={() => onRename?.(column.id)}
        onMoveRight={() => onMoveRight?.(column.id)}
        onDelete={() => onDelete?.(column.id)}
      />

      <ScrollView
        style={{
          flex: 1,
        }}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {column.cards.map(card => (
          <BoardCard
            key={card.id}
            card={card}
            isDragging={draggingCardId === card.id}
            onPress={() => onCardPress?.(card.id)}
            onDragStart={onDragStart}
            onDrag={onDrag}
            onDragEnd={(card, x, y) => onDragEnd?.(card, x, y)}
          />
        ))}
      </ScrollView>

      {column.id === 'todo' && (
        <Pressable
          onPress={() => onAddCard?.(column.id)}
          className='flex-row items-center py-3'
        >
          <AppText variant='body'>＋ Add task</AppText>
        </Pressable>
      )}
    </View>
  );
};

export default BoardColumn;
