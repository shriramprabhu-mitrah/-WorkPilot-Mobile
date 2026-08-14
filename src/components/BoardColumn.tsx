import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import BoardCard from './BoardCard';
import BoardColumnHeader from './BoardColumnHeader';

import { BoardColumn as BoardColumnType } from '../types/projectBoard.type';
import AppText from './common/AppText';

interface Props {
  column: BoardColumnType;
  onCardPress?: (cardId: string) => void;
  onAddCard?: (columnId: string) => void;
  onMorePress?: (columnId: string) => void;
}

const BoardColumn = ({
  column,
  onCardPress,
  onAddCard,
  onMorePress,
}: Props) => {
  return (
    <View className='mr-4 h-[600px] w-[300px] rounded-xl bg-gray-100 p-3'>
      <BoardColumnHeader
        title={column.title}
        count={column.cards.length}
        onMorePress={() => onMorePress?.(column.id)}
      />

      <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
        {column.cards.map(card => (
          <BoardCard
            key={card.id}
            card={card}
            onPress={() => onCardPress?.(card.id)}
          />
        ))}
      </ScrollView>

      {/* Only To Do can add tasks */}
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
