import React, { useEffect, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import AppModal from './common/AppModal';
import AppText from './common/AppText';
import { useTheme } from '../theme/ThemeProvider';

interface Props {
  visible: boolean;
  currentTitle: string;
  onClose: () => void;
  onRename: (title: string) => void;
}

const RenameColumnModal = ({
  visible,
  currentTitle,
  onClose,
  onRename,
}: Props) => {
  const { colors } = useTheme();

  const [title, setTitle] = useState(currentTitle);

  useEffect(() => {
    if (visible) {
      setTitle(currentTitle);
    }
  }, [visible, currentTitle]);

  const handleRename = () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    onRename(trimmedTitle);
  };

  return (
    <AppModal visible={visible} title='Rename column' onClose={onClose}>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder='Enter column name'
        placeholderTextColor={colors.textSecondary}
        autoFocus
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.background,
          color: colors.text,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 12,
        }}
      />

      <View className='mt-5 flex-row justify-end'>
        <Pressable
          onPress={onClose}
          className='mr-3 rounded-lg px-4 py-2'
          style={{
            backgroundColor: colors.surface,
          }}
        >
          <AppText variant='body'>Cancel</AppText>
        </Pressable>

        <Pressable
          onPress={handleRename}
          className='rounded-lg px-4 py-2'
          style={{
            backgroundColor: colors.primary,
          }}
        >
          <AppText variant='body'>Rename</AppText>
        </Pressable>
      </View>
    </AppModal>
  );
};

export default RenameColumnModal;
