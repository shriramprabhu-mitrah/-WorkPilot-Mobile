import React, { useState } from 'react';
import { View, Pressable, Modal } from 'react-native';
import AppText from './common/AppText';

interface Props {
  title: string;
  count: number;
  onRename?: () => void;
  onMoveRight?: () => void;
  onDelete?: () => void;
}

const BoardColumnHeader = ({
  title,
  count,
  onRename,
  onMoveRight,
  onDelete,
}: Props) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const handlePress = (action?: () => void) => {
    setMenuVisible(false);
    action?.();
  };

  return (
    <>
      <View className='mb-4 flex-row items-center justify-between'>
        <View className='flex-row items-center'>
          <AppText variant='body'>{title}</AppText>

          <View className='ml-2 rounded-full bg-gray-200 px-2 py-0.5'>
            <AppText variant='body'>{count}</AppText>
          </View>
        </View>

        <Pressable onPress={() => setMenuVisible(true)} className='px-2 py-1'>
          <AppText variant='body'>•••</AppText>
        </Pressable>
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType='fade'
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable className='flex-1' onPress={() => setMenuVisible(false)}>
          <View className='absolute right-4 top-20 w-52 rounded-lg bg-white p-2 shadow-lg'>
            <Pressable
              onPress={() => handlePress(onRename)}
              className='rounded-md px-3 py-3'
            >
              <AppText variant='body'>Rename column</AppText>
            </Pressable>

            <Pressable
              onPress={() => handlePress(onMoveRight)}
              className='rounded-md px-3 py-3'
            >
              <AppText variant='body'>Move to the right</AppText>
            </Pressable>

            <Pressable
              onPress={() => handlePress(onDelete)}
              className='rounded-md px-3 py-3'
            >
              <AppText variant='body'>Delete column</AppText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

export default BoardColumnHeader;
