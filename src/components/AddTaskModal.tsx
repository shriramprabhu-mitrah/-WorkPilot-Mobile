import React, { useState } from 'react';
import { Modal, Pressable, TextInput, View } from 'react-native';

import AppText from './common/AppText';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAddTask: (summary: string) => void;
}

const AddTaskModal = ({ visible, onClose, onAddTask }: Props) => {
  const [summary, setSummary] = useState('');

  const handleAddTask = () => {
    const value = summary.trim();

    if (!value) {
      return;
    }

    onAddTask(value);
    setSummary('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType='slide'
      onRequestClose={onClose}
    >
      <View className='flex-1 justify-end bg-black/40'>
        <View className='rounded-t-2xl bg-white p-5'>
          <AppText variant='body'>Add Task</AppText>

          <TextInput
            value={summary}
            onChangeText={setSummary}
            placeholder='Enter task summary'
            multiline
            textAlignVertical='top'
            className='mt-4 min-h-[120px] rounded-xl border border-gray-300 p-4'
          />

          <View className='mt-4 flex-row justify-end'>
            <Pressable onPress={onClose} className='mr-3 rounded-lg px-4 py-3'>
              <AppText variant='body'>Cancel</AppText>
            </Pressable>

            <Pressable
              onPress={handleAddTask}
              className='rounded-lg bg-white px-5 py-3'
            >
              <AppText variant='body'>Add</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddTaskModal;
