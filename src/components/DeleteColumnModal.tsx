import React from 'react';
import { Pressable, View } from 'react-native';

import AppModal from './common/AppModal';
import AppText from './common/AppText';

interface Props {
  visible: boolean;
  columnTitle: string;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteColumnModal = ({
  visible,
  columnTitle,
  onClose,
  onDelete,
}: Props) => {
  return (
    <AppModal visible={visible} title='Delete column' onClose={onClose}>
      <AppText variant='body'>
        Are you sure you want to delete "{columnTitle}"?
      </AppText>

      <View className='mt-5 flex-row justify-end'>
        <Pressable onPress={onClose} className='mr-3 rounded-lg px-4 py-2'>
          <AppText variant='body'>Cancel</AppText>
        </Pressable>

        <Pressable
          onPress={onDelete}
          className='rounded-lg bg-red-500 px-4 py-2'
        >
          <AppText variant='body'>Delete</AppText>
        </Pressable>
      </View>
    </AppModal>
  );
};

export default DeleteColumnModal;
