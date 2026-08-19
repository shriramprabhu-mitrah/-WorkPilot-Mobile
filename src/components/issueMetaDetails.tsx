import React from 'react';
import { View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import Avatar from './Avatar';
import { useAuthLayout } from '../hooks/useAuthLayout';

interface DetailItem {
  label: string;
  value: string;
  initials?: string;
  color?: string;
  dot?: string;
}

interface Props {
  details: DetailItem[];
  colors: any;
}

export const IssueMetaDetails: React.FC<Props> = ({ details, colors }) => {
  const { layout, isSmallHeight } = useAuthLayout();

  return (
    <View
      className='mt-3'
      style={{ backgroundColor: colors.card || colors.surface }}
    >
      {details.map(item => (
        <View
          key={item.label}
          className='flex-row items-center justify-between border-b'
          style={{
            borderColor: colors.itemDivider || colors.border,
            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: isSmallHeight
              ? layout.largeSectionGap
              : layout.sectionGap,
          }}
        >
          <AppText variant='body' color={colors.textSecondary}>
            {item.label}
          </AppText>
          {item.initials ? (
            <View
              className='flex-row items-center'
              style={{ gap: layout.elementGap }}
            >
              <Avatar
                size='small'
                initials={item.initials}
                color={item.color || colors.primary}
              />
              <AppText variant='body' color={colors.text}>
                {item.value}
              </AppText>
            </View>
          ) : item.dot ? (
            <View
              className='flex-row items-center'
              style={{ gap: layout.elementGap }}
            >
              <Ionicons name='flag' size={14} color={item.dot} />
              <AppText variant='body' color={colors.text}>
                {item.value}
              </AppText>
            </View>
          ) : (
            <AppText variant='body' color={colors.text}>
              {item.value}
            </AppText>
          )}
        </View>
      ))}
    </View>
  );
};
