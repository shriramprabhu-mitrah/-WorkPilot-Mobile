import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import {
  RichEditor,
  RichToolbar,
  actions,
} from 'react-native-pell-rich-editor';

import AppText from './common/AppText';
import Avatar from './Avatar';
import { AppInput } from '.';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { ThemeColors } from '../constants/Colors';
import { TextEditorIcon } from '../utils/textEditorIcon';
import { DeleteIcon } from '../utils/deleteIcon';

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
}

export const IssueCommentInput: React.FC<Props> = ({
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
}) => {
  const { layout, isSmallHeight } = useAuthLayout();

  const editorRef = useRef<RichEditor>(null);

  const [showRichEditor, setShowRichEditor] = useState(false);

  const authorName =
    currentItem?.reporter?.name || currentItem?.reporter_name || 'User';

  const avatarInitials =
    authorName !== 'User' && authorName !== 'N/A'
      ? authorName
          .split(' ')
          .filter(Boolean)
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
      : 'U';

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

  /*
   * Open rich editor automatically when editing
   * an existing comment.
   */
  useEffect(() => {
    if (editingCommentId) {
      setShowRichEditor(true);
    }
  }, [editingCommentId]);

  /*
   * Set existing comment HTML when editing.
   */
  useEffect(() => {
    if (showRichEditor) {
      editorRef.current?.setContentHTML(comment || '');
    }
  }, [showRichEditor]);

  const handleOpenEditor = () => {
    setShowRichEditor(true);

    setTimeout(() => {
      editorRef.current?.focusContentEditor();
    }, 100);
  };

  const handleCloseEditor = () => {
    setShowRichEditor(false);

    /*
     * Optional:
     * Clear comment when closing the editor.
     */
    // onChangeComment('');
  };

  return (
    <View
      className='border-t'
      style={{
        paddingHorizontal: layout.paddingHorizontal,
        paddingTop: layout.paddingTop,
        paddingBottom: layout.paddingBottom,
        borderColor: colors.border,
        backgroundColor: colors.card,
      }}
    >
      {/* Reply banner */}
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

      <View
        className='flex-row items-start'
        style={{
          gap: isSmallHeight ? layout.largeSectionGap : layout.sectionGap,
        }}
      >
        <View className='flex-1'>
          {!showRichEditor ? (
            /* =========================================
             * NORMAL INPUT
             * ========================================= */
            <AppInput
              value={comment}
              onChangeText={onChangeComment}
              placeholder={placeholder}
              style={{
                fontSize: layout.bodyFontSize,
              }}
              rightSendButton={
                <View className='flex-row items-center' style={{ gap: 12 }}>
                  {/* Text editor icon */}
                  <TouchableOpacity
                    onPress={handleOpenEditor}
                    activeOpacity={0.7}
                  >
                    <TextEditorIcon size={22} color={colors.textSecondary} />
                  </TouchableOpacity>

                  {/* Cancel edit */}
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

                  {/* Send */}
                  <TouchableOpacity
                    disabled={!comment.trim() || isSubmittingComment}
                    onPress={onSubmit}
                  >
                    <AppText
                      variant='body'
                      color={comment.trim() ? colors.primary : colors.secondary}
                      className='font-bold'
                    >
                      {submitLabel}
                    </AppText>
                  </TouchableOpacity>
                </View>
              }
            />
          ) : (
            /* =========================================
             * RICH TEXT EDITOR
             * ========================================= */
            <View
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                overflow: 'hidden',
                backgroundColor: colors.card,
              }}
            >
              <RichEditor
                ref={editorRef}
                initialContentHTML={comment}
                placeholder={placeholder}
                onChange={onChangeComment}
                useContainer
                style={{
                  minHeight: 80,
                  maxHeight: 180,
                }}
                editorStyle={{
                  backgroundColor: colors.card,
                  color: colors.text,
                  placeholderColor: colors.textSecondary,
                  contentCSSText: `
                    font-size: ${layout.bodyFontSize}px;
                    padding: 8px;
                  `,
                }}
              />

              {/* Formatting toolbar */}
              <RichToolbar
                editor={editorRef}
                actions={[
                  actions.setBold,
                  actions.setItalic,
                  actions.setUnderline,
                  actions.insertBulletsList,
                  actions.insertOrderedList,
                  actions.undo,
                  actions.redo,
                ]}
                iconTint={colors.textSecondary}
                selectedIconTint={colors.primary}
                style={{
                  backgroundColor: colors.card,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                }}
              />

              {/* Bottom actions */}
              <View
                className='flex-row items-center justify-between'
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                }}
              >
                {/* Delete / Close editor */}
                <TouchableOpacity
                  onPress={handleCloseEditor}
                  activeOpacity={0.7}
                >
                  <DeleteIcon size={21} color={colors.textSecondary} />
                </TouchableOpacity>

                <View className='flex-row items-center' style={{ gap: 12 }}>
                  {/* Cancel edit */}
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

                  {/* Send / Reply / Save */}
                  <TouchableOpacity
                    disabled={!comment.trim() || isSubmittingComment}
                    onPress={onSubmit}
                  >
                    <AppText
                      variant='body'
                      color={comment.trim() ? colors.primary : colors.secondary}
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
    </View>
  );
};
