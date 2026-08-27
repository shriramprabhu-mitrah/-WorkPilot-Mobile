import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import AppModal from './common/AppModal';
import AppText from './common/AppText';
import { ThemeColors } from '../constants/Colors';

interface Props {
  visible: boolean;
  columnTitle: string;
  colors: ThemeColors;
  onClose: () => void;
  onDelete: () => void;
}

const DeleteColumnModal = ({
  visible,
  columnTitle,
  colors,
  onClose,
  onDelete,
}: Props) => {
  return (
    <AppModal
      visible={visible}
      title='Delete column'
      colors={colors}
      onClose={onClose}
    >
      <AppText variant='body' color={colors?.text}>
        Are you sure you want to delete "{columnTitle}"?
      </AppText>

      <View className='mt-5 flex-row justify-end' style={{ gap: 12 }}>
        <TouchableOpacity
          onPress={onClose}
          className='rounded-lg px-4 py-2'
          style={{
            backgroundColor: colors?.surface || colors?.background,
            borderWidth: 1,
            borderColor: colors?.border,
          }}
        >
          <AppText variant='body' color={colors?.text}>
            Cancel
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          className='rounded-lg px-4 py-2'
          style={{
            backgroundColor: colors?.error || '#FF3B30',
          }}
        >
          <AppText variant='body' color='#FFFFFF'>
            Delete
          </AppText>
        </TouchableOpacity>
      </View>
    </AppModal>
  );
};

export default DeleteColumnModal;
