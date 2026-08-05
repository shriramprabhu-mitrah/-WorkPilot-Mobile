import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import { AppInput, PrimaryButton } from './index';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { moderateScale } from '../utils/responsive';
import { Radius } from '../constants/Radius';

interface PopupModelProps {
  visible: boolean;
  initialDescription: string;
  onClose: () => void;
  onSave: (newDescription: string) => void;
}

export const PopupModel: React.FC<PopupModelProps> = ({
  visible,
  initialDescription,
  onClose,
  onSave,
}) => {
  const { colors } = useTheme();
  const { layout } = useAuthLayout();
  const [draftDescription, setDraftDescription] = useState<string>('');
  useEffect(() => {
    if (visible) {
      setDraftDescription(initialDescription || '');
    }
  }, [visible, initialDescription]);
  const handleSave = () => {
    onSave(draftDescription);
  };

  return (
    <Modal
      visible={visible}
      animationType='fade'
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            paddingHorizontal: 16,
          }}
        >
          <View
            className='w-full max-w-md border'
            style={{
              borderRadius: Radius.lg,
              backgroundColor: colors.card || colors.surface,
              borderColor: colors.border,
              padding: layout.paddingHorizontal,
              gap: layout.sectionGap,
            }}
          >
            <View className='flex-row items-center justify-between'>
              <AppText
                variant='bodyLarge'
                color={colors.text}
                className='font-bold'
              >
                Edit Description
              </AppText>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name='close'
                  size={layout.iconSize}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <AppInput
              value={draftDescription}
              onChangeText={setDraftDescription}
              multiline
              placeholder='Enter issue description...'
              style={{ minHeight: moderateScale(120) }}
            />
            <View
              className='flex-row items-center justify-end'
              style={{ gap: layout.elementGap }}
            >
              <TouchableOpacity
                onPress={onClose}
                className='border px-4 py-2'
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: Radius.md,
                }}
              >
                <AppText variant='body' color={colors.textSecondary}>
                  Cancel
                </AppText>
              </TouchableOpacity>
              <PrimaryButton
                title='Update'
                className='px-5 py-2'
                onPress={handleSave}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default PopupModel;
