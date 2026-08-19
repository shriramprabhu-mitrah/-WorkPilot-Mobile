import React from 'react';
import {
  View,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from '../components/common/AppText';
import { Radius } from '../constants/Radius';
import { useAuthLayout } from '../hooks/useAuthLayout';
import {
  getStatusLabel,
  getStatusThemeColor,
  STATUS_OPTIONS,
  TASK_STATUS_LABELS,
} from '../utils/enum';

interface Props {
  hooks: any;
}

export const IssueHeaderSection: React.FC<Props> = ({ hooks }) => {
  const { colors } = hooks;
  const { layout } = useAuthLayout();

  return (
    <View
      className='z-10 border-b'
      style={{
        backgroundColor: colors.card || colors.surface,
        borderColor: colors.border,
        paddingHorizontal: layout.paddingHorizontal,
        paddingVertical: layout.largeSectionGap,
        gap: layout.elementGap,
      }}
    >
      <AppText
        variant='title'
        color={colors.text}
        className='text-xl font-bold'
      >
        {hooks.currentItem?.title}
      </AppText>

      <View className='relative z-20'>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => hooks.setShowStatusPicker((prev: boolean) => !prev)}
          className='flex-row items-center self-start rounded-lg border'
          style={{
            backgroundColor: `${hooks.activeStatusColor}1A`,
            borderColor: colors.border,
            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: layout.elementGap,
            gap: layout.tightGap,
          }}
        >
          <View
            className='mr-1 rounded-full'
            style={{
              width: 8,
              height: 8,
              backgroundColor: hooks.activeStatusColor,
            }}
          />
          <AppText
            variant='body'
            color={hooks.activeStatusColor}
            className='font-semibold'
          >
            {getStatusLabel(hooks.status || hooks.currentItem?.status)}
          </AppText>
          <Ionicons
            name='chevron-down'
            size={layout.controlSize * 0.8}
            color={hooks.activeStatusColor}
          />
        </TouchableOpacity>

        {hooks.showStatusPicker && (
          <Modal
            transparent
            visible={hooks.showStatusPicker}
            animationType='fade'
            onRequestClose={() => hooks.setShowStatusPicker(false)}
          >
            <TouchableWithoutFeedback
              onPress={() => hooks.setShowStatusPicker(false)}
            >
              <View className='flex-1 items-center justify-center bg-black/20 px-6'>
                <TouchableWithoutFeedback>
                  <View
                    className='w-full border'
                    style={{
                      borderRadius: Radius.lg,
                      backgroundColor: colors.card || colors.surface,
                      borderColor: colors.border,
                      paddingHorizontal: layout.paddingHorizontal,
                      paddingVertical: layout.elementGap,
                      shadowColor: colors.black,
                      shadowOpacity: 0.12,
                      shadowRadius: 10,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 5,
                    }}
                  >
                    {STATUS_OPTIONS.map(enumKey => {
                      const isSelected =
                        (
                          hooks.status || hooks.currentItem?.status
                        )?.toLowerCase() === enumKey;
                      const itemColor = getStatusThemeColor(enumKey, colors);
                      return (
                        <TouchableOpacity
                          key={enumKey}
                          activeOpacity={0.8}
                          onPress={() => {
                            hooks.setStatus(enumKey);
                            hooks.setShowStatusPicker(false);
                          }}
                          className='flex-row items-center'
                          style={{
                            paddingVertical: layout.elementGap,
                            gap: layout.largeSectionGap,
                          }}
                        >
                          <View
                            className='rounded-full'
                            style={{
                              width: 8,
                              height: 8,
                              backgroundColor: itemColor,
                            }}
                          />
                          <AppText
                            variant='body'
                            color={isSelected ? itemColor : colors.text}
                            className={isSelected ? 'font-bold' : 'font-normal'}
                          >
                            {TASK_STATUS_LABELS[enumKey] ||
                              getStatusLabel(enumKey)}
                          </AppText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
      </View>
    </View>
  );
};
