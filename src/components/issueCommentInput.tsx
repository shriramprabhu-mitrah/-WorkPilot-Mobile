import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import AppText from './common/AppText';
import Avatar from './Avatar';
import { AppInput } from '.';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { ThemeColors } from '../constants/Colors';

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
  replyingToName?: string | undefined;
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
  const { layout, isSmallHeight, hp } = useAuthLayout();

  // Extract author details dynamically from currentItem (reporter) or fall back nicely
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

  return (
    <View
      className='border-t'
      style={{
        paddingHorizontal: layout.paddingHorizontal,
        paddingTop: layout.paddingTop,
        borderColor: colors.border,
        gap: isSmallHeight ? layout.largeSectionGap : layout.sectionGap,
        backgroundColor: colors.card,
        paddingBottom: isSmallHeight ? hp(8.75) : hp(8),
      }}
    >
      {showReplyBanner && (
        <View
          className='flex-row items-center justify-between'
          style={{ marginBottom: 4 }}
        >
          <AppText variant='caption' color={colors.textSecondary}>
            {`Replying to @${replyingToName || 'comment'}`}
          </AppText>
          <TouchableOpacity onPress={() => onCancelReply?.()}>
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
        className='flex-row items-center'
        style={{
          gap: isSmallHeight ? layout.largeSectionGap : layout.sectionGap,
        }}
      >
        <Avatar
          size='medium'
          initials={avatarInitials}
          color={colors.primary}
        />
        <View className='flex-1'>
          <AppInput
            value={comment}
            onChangeText={onChangeComment}
            placeholder={placeholder}
            style={{ fontSize: layout.bodyFontSize }}
            rightSendButton={
              <View className='flex-row items-center' style={{ gap: 12 }}>
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
        </View>
      </View>
    </View>
  );
};
