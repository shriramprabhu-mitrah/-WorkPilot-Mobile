import React from 'react';
import { View, Image, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from '../common/AppText';
import { AttachmentFile } from '../../data/addNewIssuesData';
import { Radius } from '../../constants/Radius';

interface AttachmentListProps {
  attachments: AttachmentFile[];
  onRemoveAttachment: (id: string) => void;
  colors: any;
  layout: any;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  onRemoveAttachment,
  colors,
  layout,
}) => {
  if (attachments.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        gap: layout.elementGap,
        marginTop: layout.tightGap,
      }}
    >
      {attachments.map(item => {
        const isImage = item.type === 'image' || item.type === 'document';
        const isVideo = item.type === 'video';

        return (
          <View
            key={item.id}
            style={{
              width: 110,
              height: 110,
              borderRadius: Radius.xs,
              backgroundColor: colors.surface || '#F3F4F6',
              borderColor: colors.border,
              borderWidth: 1,
              position: 'relative',
              padding: 6,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Delete / Remove Icon */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onRemoveAttachment(item.id)}
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                zIndex: 10,
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: Radius.circle,
                padding: 2,
              }}
            >
              <Ionicons name='close' size={16} color='#FFFFFF' />
            </TouchableOpacity>

            {/* Content Preview */}
            {isImage ? (
              <Image
                source={{ uri: item.uri }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: Radius.xs,
                }}
                resizeMode='cover'
              />
            ) : (
              <View className='items-center justify-center p-2'>
                <Ionicons
                  name={isVideo ? 'videocam-outline' : 'document-text-outline'}
                  size={32}
                  color={colors.primary}
                />
                <AppText
                  variant='caption'
                  color={colors.text}
                  numberOfLines={1}
                  className='mt-1 text-center font-medium'
                >
                  {item.name}
                </AppText>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};
