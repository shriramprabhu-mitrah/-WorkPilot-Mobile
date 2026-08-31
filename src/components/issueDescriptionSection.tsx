import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { ThemeColors } from '../constants/Colors';
import { renderParsedHtml } from '../utils/htmlParser';

interface Props {
  description: string;
  colors: ThemeColors;
  onEdit: () => void;
}

export const IssueDescriptionSection: React.FC<Props> = ({
  description,
  colors,
  onEdit,
}) => {
  const { layout } = useAuthLayout();

  return (
    <View
      className='mt-3'
      style={{
        backgroundColor: colors.card || colors.surface,
        paddingHorizontal: layout.paddingHorizontal,
        paddingVertical: layout.sectionGap,
        gap: layout.sectionGap,
      }}
    >
      <View className='flex-row items-center justify-between'>
        <AppText variant='bodyLarge' color={colors.text} className='font-bold'>
          Description
        </AppText>
        <TouchableOpacity
          onPress={onEdit}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name='pencil-sharp'
            size={layout.iconSize * 0.8}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
      <AppText variant='body' color={colors.text} className='leading-6'>
        {renderParsedHtml(description, {
          color: colors.text,
          lineHeight: 22,
        }) || 'No description provided.'}
      </AppText>
    </View>
  );
};
