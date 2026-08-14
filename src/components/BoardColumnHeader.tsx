import React from 'react';
import { View, Pressable } from 'react-native';
import AppText from './common/AppText';

interface Props {
  title: string;
  count: number;
  onMorePress?: () => void;
}

const BoardColumnHeader = ({ title, count, onMorePress }: Props) => {
  return (
    <View className='mb-4 flex-row items-center justify-between'>
      <View className='flex-row items-center'>
        <AppText variant='body'>{title}</AppText>

        <View className='ml-2 rounded-full bg-gray-200 px-2 py-0.5'>
          <AppText variant='body'>{count}</AppText>
        </View>
      </View>

      <Pressable onPress={onMorePress}>
        <AppText variant='body'>•••</AppText>
      </Pressable>
    </View>
  );
};

export default BoardColumnHeader;
