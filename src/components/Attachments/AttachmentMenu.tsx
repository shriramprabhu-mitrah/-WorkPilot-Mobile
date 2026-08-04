import React from 'react';
import { Menu } from 'react-native-paper';
import Ionicons from '@react-native-vector-icons/ionicons';

interface AttachmentMenuProps {
  visible: boolean;
  onDismiss: () => void;
  onSelectOption: (optionId: string) => void;
  anchor: React.ReactNode;
}

export const AttachmentMenu: React.FC<AttachmentMenuProps> = ({
  visible,
  onDismiss,
  onSelectOption,
  anchor,
}) => {
  const handlePress = (id: string) => {
    onDismiss();
    onSelectOption(id);
  };

  return (
    <Menu visible={visible} onDismiss={onDismiss} anchor={anchor}>
      <Menu.Item
        onPress={() => handlePress('1')}
        title='Choose Photo or Video'
        leadingIcon={() => <Ionicons name='images-outline' size={20} />}
      />
      <Menu.Item
        onPress={() => handlePress('2')}
        title='Take Photo'
        leadingIcon={() => <Ionicons name='camera-outline' size={20} />}
      />
      <Menu.Item
        onPress={() => handlePress('3')}
        title='Record Video'
        leadingIcon={() => <Ionicons name='videocam-outline' size={20} />}
      />
      <Menu.Item
        onPress={() => handlePress('4')}
        title='Choose File'
        leadingIcon={() => (
          <Ionicons name='document-attach-outline' size={20} />
        )}
      />
    </Menu>
  );
};
