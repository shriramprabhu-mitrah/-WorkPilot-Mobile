import React from 'react';
import { Pressable } from 'react-native';
import AppText from './common/AppText';

interface Props {
  onPress: () => void;
}

const AddNewColumn = ({ onPress }: Props) => {
  return (
    <Pressable
      onPress={onPress}
      className='mr-4 h-[120px] w-[300px] items-center justify-center rounded-xl border border-dashed border-gray-400'
    >
      <AppText variant='body'>+ Add new column</AppText>
    </Pressable>
  );
};

export default AddNewColumn;
