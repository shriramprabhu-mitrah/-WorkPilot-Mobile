import React from 'react';
import {
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import { ThemeColors } from '../constants/Colors';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { moderateScale } from '../utils/responsive';

interface Props {
  visible: boolean;
  columnTitle: string;
  colors: ThemeColors;
  onClose: () => void;
  onDelete: () => void;
  title?: string;
  loading?: boolean;
}

const DeleteColumnModal: React.FC<Props> = ({
  visible,
  columnTitle,
  colors,
  onClose,
  onDelete,
  title = 'Delete',
  loading = false,
}) => {
  const { layout, isSmallHeight } = useAuthLayout();

  const verticalPadding = isSmallHeight ? moderateScale(16) : moderateScale(20);
  const buttonPadding = isSmallHeight ? moderateScale(10) : moderateScale(12);
  const contentGap = isSmallHeight ? moderateScale(12) : layout.sectionGap;

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={loading ? undefined : onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={loading ? undefined : onClose}>
        <View
          className='flex-1 items-center justify-center'
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.55)' }}
        >
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View
              className='w-11/12 max-w-sm rounded-2xl border'
              style={{
                backgroundColor: colors.card || colors.surface,
                borderColor: colors.border,
                paddingHorizontal: layout.paddingHorizontal,
                paddingVertical: verticalPadding,
                gap: contentGap,
              }}
            >
              {/* Header */}
              <View className='flex-row items-center justify-between'>
                <AppText
                  variant='title'
                  color={colors.text}
                  className='flex-1 font-bold'
                  numberOfLines={1}
                >
                  {title}
                </AppText>

                <TouchableOpacity
                  onPress={onClose}
                  disabled={loading}
                  className='items-center justify-center rounded-full'
                  style={{
                    width: moderateScale(30),
                    height: moderateScale(30),
                    backgroundColor: colors.surface || colors.background,
                  }}
                  hitSlop={10}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name='close'
                    size={moderateScale(16)}
                    color={colors.textSecondary || colors.text}
                  />
                </TouchableOpacity>
              </View>

              {/* Body */}
              <View>
                <AppText
                  variant='body'
                  color={colors.text}
                  style={{ lineHeight: moderateScale(22) }}
                >
                  Are you sure you want to delete{' '}
                  <AppText
                    variant='body'
                    color={colors.text}
                    className='font-bold'
                  >
                    "{columnTitle}"
                  </AppText>
                  ? This action cannot be undone.
                </AppText>
              </View>

              {/* Actions Footer */}
              <View
                className='flex-row items-center'
                style={{
                  marginTop: layout.tightGap,
                  gap: layout.elementGap,
                }}
              >
                <TouchableOpacity
                  onPress={onClose}
                  disabled={loading}
                  activeOpacity={0.7}
                  className='flex-1 items-center justify-center rounded-xl border'
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.surface || colors.background,
                    paddingVertical: buttonPadding,
                  }}
                >
                  <AppText
                    variant='body'
                    color={colors.text}
                    className='font-medium'
                  >
                    Cancel
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={onDelete}
                  disabled={loading}
                  activeOpacity={0.8}
                  className='flex-1 flex-row items-center justify-center rounded-xl'
                  style={{
                    backgroundColor: colors.error || '#FF3B30',
                    paddingVertical: buttonPadding,
                    gap: 6,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator size='small' color='#FFFFFF' />
                  ) : (
                    <>
                      <Ionicons
                        name='trash-outline'
                        size={moderateScale(16)}
                        color='#FFFFFF'
                      />
                      <AppText
                        variant='body'
                        color='#FFFFFF'
                        className='font-medium'
                      >
                        Delete
                      </AppText>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default React.memo(DeleteColumnModal);
