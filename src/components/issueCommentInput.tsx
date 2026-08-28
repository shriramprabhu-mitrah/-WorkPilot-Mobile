import React, {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Modal,
  Image,
  Alert,
  PermissionsAndroid,
  Platform,
  Pressable,
} from 'react-native';
import {
  RichEditor,
  RichToolbar,
  actions,
} from 'react-native-pell-rich-editor';
import Ionicons from '@react-native-vector-icons/ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import {
  pick,
  types,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from './common/AppText';
import { WorkItemIcon } from '../components/common/getWorkItemIcon';
import { AttachmentFile } from '../data/addNewIssuesData';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { ThemeColors } from '../constants/Colors';

export interface IssueCommentInputRef {
  dismissFocus: () => void;
  focus: () => void;
}

interface Props {
  colors: ThemeColors;
  comment: string;
  onChangeComment: (text: string) => void;
  editingCommentId: string | null;
  onCancelEdit: () => void;
  isSubmittingComment: boolean;
  onSubmit: () => void;
  currentItem: any;
  replyingToCommentId?: string | null;
  replyingToName?: string;
  onCancelReply?: () => void;
  attachments?: AttachmentFile[];
  onAttachmentsChange?: (
    updater: AttachmentFile[] | ((prev: AttachmentFile[]) => AttachmentFile[]),
  ) => void;
  autoFocus?: boolean;
}

export const IssueCommentInput = forwardRef<IssueCommentInputRef, Props>(
  (
    {
      colors,
      comment,
      onChangeComment,
      editingCommentId,
      onCancelEdit,
      isSubmittingComment,
      onSubmit,
      currentItem,
      replyingToCommentId,
      replyingToName,
      onCancelReply,
      attachments: externalAttachments,
      onAttachmentsChange: externalOnAttachmentsChange,
      autoFocus = false,
    },
    ref,
  ) => {
    const { layout } = useAuthLayout();
    const editorRef = useRef<RichEditor>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isUpperCase, setIsUpperCase] = useState(false);
    const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
    const insets = useSafeAreaInsets();

    // Internal attachments fallback if not controlled externally
    const [internalAttachments, setInternalAttachments] = useState<
      AttachmentFile[]
    >([]);
    const attachments = externalAttachments ?? internalAttachments;
    const onAttachmentsChange =
      externalOnAttachmentsChange ?? setInternalAttachments;

    const openBottomSheet = () => {
      Keyboard.dismiss();
      setBottomSheetVisible(true);
    };

    const requestCameraPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
          return false;
        }
      }
      return true;
    };

    const handleChoosePhotoOrVideo = async () => {
      try {
        const media = await ImagePicker.openPicker({
          mediaType: 'any',
          cropping: false,
        });
        const isVideo = media.mime?.startsWith('video');
        const newFile: AttachmentFile = {
          id: `${Date.now()}`,
          uri: media.path,
          name:
            media.filename || `${isVideo ? 'video' : 'photo'}_${Date.now()}`,
          type: isVideo ? 'video' : 'image',
          size: media.size,
        };
        onAttachmentsChange((prev: AttachmentFile[]) => [...prev, newFile]);
      } catch (error: any) {
        if (error?.code !== 'E_PICKER_CANCELLED') {
          Alert.alert('Error', error?.message || 'Failed to pick media');
        }
      }
    };

    const handleTakePhoto = async () => {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera access required.');
        return;
      }
      try {
        const image = await ImagePicker.openCamera({
          mediaType: 'photo',
          cropping: true,
          freeStyleCropEnabled: true,
          compressImageQuality: 0.8,
        });
        const newFile: AttachmentFile = {
          id: `${Date.now()}`,
          uri: image.path,
          name: `photo_${Date.now()}.jpg`,
          type: 'image',
          size: image.size,
        };
        onAttachmentsChange((prev: AttachmentFile[]) => [...prev, newFile]);
      } catch (error: any) {
        if (error?.code !== 'E_PICKER_CANCELLED') {
          Alert.alert('Error', error?.message || 'Failed to capture photo');
        }
      }
    };

    const handleRecordVideo = async () => {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera access required.');
        return;
      }
      try {
        const video = await ImagePicker.openCamera({
          mediaType: 'video',
        });
        const newFile: AttachmentFile = {
          id: `${Date.now()}`,
          uri: video.path,
          name: `video_${Date.now()}.mp4`,
          type: 'video',
          size: video.size,
        };
        onAttachmentsChange((prev: AttachmentFile[]) => [...prev, newFile]);
      } catch (error: any) {
        if (error?.code !== 'E_PICKER_CANCELLED') {
          Alert.alert('Error', error?.message || 'Failed to record video');
        }
      }
    };

    const handleChooseFile = async () => {
      try {
        const res = await pick({
          type: [types.allFiles],
          allowMultiSelection: true,
        });
        const newFiles: AttachmentFile[] = res.map((doc, index) => ({
          id: `${Date.now()}-${index}`,
          uri: doc.uri,
          name: doc.name || 'Document',
          type: 'file' as const,
          size: doc.size ?? undefined,
        }));
        onAttachmentsChange((prev: AttachmentFile[]) => [
          ...prev,
          ...newFiles,
        ]);
      } catch (err) {
        if (
          isErrorWithCode(err) &&
          err.code === errorCodes.OPERATION_CANCELED
        ) {
          return;
        }
        Alert.alert('Error', 'Unable to pick document');
      }
    };

    const handleSelectAttachmentOption = (optionId: string) => {
      setBottomSheetVisible(false);
      switch (optionId) {
        case '1':
          handleChoosePhotoOrVideo();
          break;
        case '2':
          handleTakePhoto();
          break;
        case '3':
          handleRecordVideo();
          break;
        case '4':
          handleChooseFile();
          break;
      }
    };

    const handleRemoveAttachment = (id: string) => {
      onAttachmentsChange((prev: AttachmentFile[]) =>
        prev.filter(item => item.id !== id),
      );
    };

    const showReplyBanner = Boolean(replyingToCommentId);
    const showInlineCancel = Boolean(editingCommentId);

    const submitLabel = editingCommentId
      ? 'Save'
      : replyingToCommentId
        ? 'Reply'
        : 'Send';

    const placeholder = editingCommentId
      ? 'Edit your comment...'
      : replyingToCommentId
        ? 'Enter your reply...'
        : 'Add a comment...';

    // Dismiss focus, hide keyboard, and hide rich toolbar
    const handleDismissFocus = () => {
      Keyboard.dismiss();
      editorRef.current?.blurContentEditor();
      setIsFocused(false);
    };

    const handleFocus = () => {
      editorRef.current?.focusContentEditor();
      setIsFocused(true);
    };

    // Expose methods to parent component ref
    useImperativeHandle(ref, () => ({
      dismissFocus: handleDismissFocus,
      focus: handleFocus,
    }));

    // Ensure keyboard and focus are explicitly dismissed on unmount
    useEffect(() => {
      return () => {
        handleDismissFocus();
      };
    }, []);

    // Sync state changes directly with RichEditor HTML
    useEffect(() => {
      if (editorRef.current) {
        if (!comment) {
          editorRef.current.setContentHTML('');
        } else if (editingCommentId) {
          editorRef.current.setContentHTML(comment);
        }
      }
    }, [comment, editingCommentId]);

    // Strip HTML tags to check if comment has non-whitespace text
    const isCommentEmpty =
      !comment.replace(/<[^>]*>/g, '').trim() && attachments.length === 0;

    // Show toolbar when actively focused, editing, or when files are attached
    const showToolbar =
      isFocused || Boolean(editingCommentId) || attachments.length > 0;

    // Toggle Text Case (Uppercase / Lowercase)
    const handleToggleCase = () => {
      const rawText = comment.replace(/<[^>]*>/g, '');
      if (!rawText.trim()) return;

      if (!isUpperCase) {
        const upperHtml = comment.toUpperCase();
        onChangeComment(upperHtml);
        editorRef.current?.setContentHTML(upperHtml);
        setIsUpperCase(true);
      } else {
        const lowerHtml = comment.toLowerCase();
        onChangeComment(lowerHtml);
        editorRef.current?.setContentHTML(lowerHtml);
        setIsUpperCase(false);
      }
    };

    // Remaining scrollable rich text tools
    const scrollableActions = [
      actions.setBold,
      actions.setItalic,
      actions.setUnderline,
      actions.heading1,
      actions.insertBulletsList,
      actions.insertOrderedList,
      actions.indent,
      actions.outdent,
      actions.checkboxList,
      actions.insertLink,
      actions.alignLeft,
      actions.alignCenter,
      actions.alignRight,
      actions.removeFormat,
      actions.undo,
      actions.redo,
    ];

    return (
      <View className='relative'>
        {/* Transparent dismiss layer - only rendered if focused without active modals */}
        {isFocused && (
          <TouchableWithoutFeedback onPress={handleDismissFocus}>
            <View
              style={{
                position: 'absolute',
                top: -1000,
                bottom: -1000,
                left: -1000,
                right: -1000,
                backgroundColor: 'transparent',
                zIndex: 1,
              }}
            />
          </TouchableWithoutFeedback>
        )}

        <View
          style={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingTop: 10,
            paddingBottom: layout.paddingBottom,
            borderColor: colors.border,
            backgroundColor: colors.card,
            borderTopWidth: 1,
            zIndex: 10,
          }}
        >
          {/* Reply Header Banner */}
          {showReplyBanner && (
            <View
              className='flex-row items-center justify-between'
              style={{ marginBottom: 8 }}
            >
              <AppText variant='caption' color={colors.textSecondary}>
                {`Replying to @${replyingToName || 'comment'}`}
              </AppText>
              <TouchableOpacity onPress={onCancelReply}>
                <AppText
                  variant='caption'
                  color={colors.primary}
                  className='font-semibold'
                >
                  Cancel
                </AppText>
              </TouchableOpacity>
            </View>
          )}

          {/* Editor Main Box Container */}
          <View
            style={{
              borderWidth: 1,
              borderColor: isFocused ? colors.primary : colors.border,
              borderRadius: 8,
              backgroundColor: colors.card,
            }}
          >
            {/* Rich Text Input Field */}
            <RichEditor
              ref={editorRef}
              initialContentHTML={comment}
              placeholder={placeholder}
              onChange={onChangeComment}
              onFocus={() => setIsFocused(true)}
              useContainer
              disabled={false}
              style={{
                minHeight: 50,
                maxHeight: 150,
              }}
              editorStyle={{
                backgroundColor: colors.card,
                color: colors.text,
                placeholderColor: colors.textSecondary,
                contentCSSText: `
                  font-size: ${layout.bodyFontSize}px;
                  padding: 8px;
                  outline: none;
                  -webkit-user-select: text;
                  user-select: text;
                `,
              }}
            />

            {/* Inline Attachment Previews */}
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

            {/* Bottom Toolbar Area */}
            {showToolbar && (
              <View
                style={{
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  backgroundColor: colors.card,
                }}
              >
                <View className='flex-row items-center justify-between'>
                  <View className='flex-1 flex-row items-center'>
                    {/* 1. Attachment Button */}
                    <TouchableOpacity
                      onPress={openBottomSheet}
                      activeOpacity={0.7}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 8,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <WorkItemIcon
                        type='add'
                        size={22}
                        color={colors.primary}
                      />
                    </TouchableOpacity>

                    {/* 2. Letter Case Toggle Icon */}
                    <TouchableOpacity
                      onPress={handleToggleCase}
                      activeOpacity={0.7}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 6,
                        marginHorizontal: 2,
                        borderRadius: 6,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: isUpperCase
                          ? `${colors.primary}20`
                          : 'transparent',
                      }}
                    >
                      <WorkItemIcon
                        type='format-letter-case'
                        size={22}
                        color={
                          isUpperCase ? colors.primary : colors.textSecondary
                        }
                      />
                    </TouchableOpacity>

                    {/* Vertical Divider */}
                    <View
                      style={{
                        width: 1,
                        height: 20,
                        backgroundColor: colors.border,
                        marginHorizontal: 4,
                      }}
                    />

                    {/* 3. Scrollable Rich Text Tools */}
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ alignItems: 'center' }}
                      style={{ flex: 1 }}
                      keyboardShouldPersistTaps='always'
                    >
                      <RichToolbar
                        editor={editorRef}
                        actions={scrollableActions}
                        iconTint={colors.textSecondary}
                        selectedIconTint={colors.primary}
                        style={{
                          backgroundColor: 'transparent',
                        }}
                      />
                    </ScrollView>
                  </View>

                  {/* Right Action Buttons */}
                  <View
                    className='flex-row items-center'
                    style={{ gap: 12, paddingRight: 10, paddingLeft: 6 }}
                  >
                    {showInlineCancel && (
                      <TouchableOpacity onPress={onCancelEdit}>
                        <AppText
                          variant='body'
                          color={colors.textSecondary}
                          className='font-medium'
                        >
                          Cancel
                        </AppText>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      disabled={isCommentEmpty || isSubmittingComment}
                      onPress={onSubmit}
                    >
                      <AppText
                        variant='body'
                        color={
                          !isCommentEmpty ? colors.primary : colors.secondary
                        }
                        className='font-bold'
                      >
                        {submitLabel}
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Attachment Bottom Sheet */}
        <Modal
          visible={bottomSheetVisible}
          transparent
          animationType='slide'
          onRequestClose={() => setBottomSheetVisible(false)}
          statusBarTranslucent
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          >
            <Pressable
              style={{ flex: 1 }}
              onPress={() => setBottomSheetVisible(false)}
            />
            <View
              style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingBottom: insets.bottom + 16,
              }}
            >
              {/* Handle */}
              <View style={{ alignItems: 'center', paddingVertical: 12 }}>
                <View
                  style={{
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: colors.border,
                  }}
                />
              </View>

              {/* Title */}
              <AppText
                variant='bodyLarge'
                color={colors.text}
                className='font-bold'
                style={{ paddingHorizontal: 20, marginBottom: 12 }}
              >
                Add Attachment
              </AppText>

              {/* Options */}
              {[
                {
                  id: '1',
                  icon: 'images-outline',
                  label: 'Choose Photo or Video',
                },
                { id: '2', icon: 'camera-outline', label: 'Take Photo' },
                { id: '3', icon: 'videocam-outline', label: 'Record Video' },
                {
                  id: '4',
                  icon: 'document-attach-outline',
                  label: 'Choose File',
                },
              ].map(option => (
                <TouchableOpacity
                  key={option.id}
                  activeOpacity={0.7}
                  onPress={() => handleSelectAttachmentOption(option.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    gap: 16,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: `${colors.primary}15`,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={colors.primary}
                    />
                  </View>
                  <AppText
                    variant='body'
                    color={colors.text}
                    className='font-medium'
                  >
                    {option.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
      </View>
    );
  },
);

IssueCommentInput.displayName = 'IssueCommentInput';
