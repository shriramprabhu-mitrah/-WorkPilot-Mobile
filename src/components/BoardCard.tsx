import React from 'react';
import { Pressable, View } from 'react-native';
import { BoardCard as BoardCardType } from '../types/projectBoard.type';
import AppText from './common/AppText';

interface Props {
  card: BoardCardType;
  onPress?: () => void;
}

const BoardCard = ({ card, onPress }: Props) => {
  return (
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
  );
};

export default BoardCard;
