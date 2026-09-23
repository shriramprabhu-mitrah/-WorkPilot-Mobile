import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import { PrimaryButton } from './index';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { moderateScale } from '../utils/responsive';
import { Radius } from '../constants/Radius';
import {
  RichEditor,
  RichToolbar,
  actions,
} from 'react-native-pell-rich-editor';
import { AttachmentFile } from '../types/attachment.type';

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
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const editorRef = useRef<RichEditor>(null);

  useEffect(() => {
    if (visible) {
      setDraftDescription(initialDescription || '');
      const t = setTimeout(() => {
        editorRef.current?.setContentHTML(initialDescription || '');
      }, 50);
      return () => clearTimeout(t);
    }
  }, [visible, initialDescription]);

  const handleSave = () => {
    let mediaHtml = '';
    attachments.forEach(att => {
      const url = att.remoteUrl || att.uri;
      if (url) {
        if (att.type === 'video') {
          mediaHtml += `<p><video src="${url}" controls style="max-width: 100%; border-radius: 8px;"></video></p>`;
        } else {
          mediaHtml += `<p><img src="${url}" alt="${att.name}" style="max-width: 100%; border-radius: 8px;" /></p>`;
        }
      }
    });

    const finalContent = `${draftDescription}${
      mediaHtml ? `<br/>${mediaHtml}` : ''
    }`.trim();

    onSave(finalContent);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(item => item.id !== id));
  };

  const toolbarActions = [
    actions.setBold,
    actions.setItalic,
    actions.setUnderline,
    actions.heading1,
    actions.heading2,
    actions.insertBulletsList,
    actions.insertOrderedList,
    actions.insertLink,
    actions.alignLeft,
    actions.alignCenter,
    actions.alignRight,
    actions.undo,
    actions.redo,
  ];

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
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            paddingHorizontal: 16,
            paddingVertical: 24,
          }}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
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

            <View
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: Radius.md,
                backgroundColor: colors.surface,
                overflow: 'hidden',
              }}
            >
              <RichEditor
                ref={editorRef}
                initialContentHTML={initialDescription || ''}
                placeholder='Enter issue description...'
                onChange={descriptionText =>
                  setDraftDescription(descriptionText)
                }
                useContainer
                style={{
                  minHeight: moderateScale(160),
                  maxHeight: moderateScale(320),
                }}
                editorStyle={{
                  backgroundColor: colors.surface,
                  color: colors.text,
                  placeholderColor: colors.textSecondary,
                  contentCSSText: `
                      font-size: ${layout.bodyFontSize}px;
                      padding: 10px;
                      outline: none;
                      -webkit-user-select: text;
                      user-select: text;
                    `,
                }}
              />

              {attachments.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps='always'
                  contentContainerStyle={{
                    paddingHorizontal: 8,
                    paddingVertical: 8,
                    gap: 8,
                  }}
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  {attachments.map(item => {
                    const isImage =
                      item.type === 'image' || item.type === 'document';
                    const isVideo = item.type === 'video';

                    return (
                      <View
                        key={item.id}
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 8,
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                          borderWidth: 1,
                          overflow: 'hidden',
                        }}
                      >
                        {isImage ? (
                          <Image
                            source={{ uri: item.uri }}
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: 7,
                            }}
                            resizeMode='cover'
                          />
                        ) : (
                          <View
                            style={{
                              flex: 1,
                              justifyContent: 'center',
                              alignItems: 'center',
                              padding: 4,
                            }}
                          >
                            <Ionicons
                              name={
                                isVideo
                                  ? 'videocam-outline'
                                  : 'document-text-outline'
                              }
                              size={24}
                              color={colors.primary}
                            />
                            <AppText
                              variant='caption'
                              color={colors.textSecondary}
                              numberOfLines={1}
                              style={{ fontSize: 9, marginTop: 2 }}
                            >
                              {item.name}
                            </AppText>
                          </View>
                        )}

                        {item.isUploading && (
                          <View
                            style={{
                              position: 'absolute',
                              inset: 0,
                              backgroundColor: 'rgba(0,0,0,0.4)',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <ActivityIndicator
                              size='small'
                              color={colors.white || '#FFFFFF'}
                            />
                          </View>
                        )}

                        <TouchableOpacity
                          onPress={() => handleRemoveAttachment(item.id)}
                          style={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            backgroundColor: colors.card,
                            borderRadius: 10,
                            zIndex: 10,
                          }}
                        >
                          <Ionicons
                            name='close-circle'
                            size={20}
                            color={colors.error || '#FF3B30'}
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>
              )}

              {/* Bottom Toolbar */}
              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  backgroundColor: colors.card,
                }}
                className='flex-row items-center justify-between'
              >
                <View
                  style={{
                    width: 1,
                    height: 20,
                    backgroundColor: colors.border,
                    marginHorizontal: 4,
                  }}
                />

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ alignItems: 'center' }}
                  style={{ flex: 1 }}
                  keyboardShouldPersistTaps='always'
                >
                  <RichToolbar
                    editor={editorRef}
                    actions={toolbarActions}
                    iconTint={colors.textSecondary}
                    selectedIconTint={colors.primary}
                    style={{ backgroundColor: 'transparent' }}
                  />
                </ScrollView>
              </View>
            </View>

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
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default PopupModel;
