import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import AppText from './common/AppText';
import Avatar from './Avatar';
import { AppInput } from '.';
import { useAuthLayout } from '../hooks/useAuthLayout';

interface Props {
  hooks: any;
}

export const IssueCommentInput: React.FC<Props> = ({ hooks }) => {
  const {
    colors,
    comment,
    setComment,
    editingCommentId,
    setEditingCommentId,
    replyingToId,
    setReplyingToId,
    isSubmittingComment,
    handleSendComment,
    handleUpdateComment,
    currentItem,
  } = hooks;
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
      {/* {replyingToId && !editingCommentId && (
        <View
          className='mb-2 flex-row items-center justify-between rounded-lg px-3 py-1.5'
          style={{ backgroundColor: colors.surface }}
        >
          <AppText
            variant='caption'
            color={colors.primary}
            className='font-medium'
          >
            Replying to comment...
          </AppText>
          <TouchableOpacity onPress={() => setReplyingToId(null)}>
            <Ionicons name='close' size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )} */}

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
            onChangeText={setComment}
            placeholder={
              editingCommentId
                ? 'Edit your comment...'
                : replyingToId
                  ? 'Write a reply...'
                  : 'Add a comment...'
            }
            style={{ fontSize: layout.bodyFontSize }}
            rightSendButton={
              <View className='flex-row items-center' style={{ gap: 12 }}>
                {(editingCommentId || replyingToId) && (
                  <TouchableOpacity
                    onPress={() => {
                      setEditingCommentId(null);
                      setReplyingToId(null);
                      setComment('');
                    }}
                  >
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
                  onPress={
                    editingCommentId ? handleUpdateComment : handleSendComment
                  }
                >
                  {/* {isSubmittingComment ? (
                    <ActivityIndicator size='small' color={colors.primary} />
                  ) : ( */}
                  <AppText
                    variant='body'
                    color={comment.trim() ? colors.primary : colors.secondary}
                    className='font-bold'
                  >
                    {editingCommentId ? 'Save' : 'Send'}
                  </AppText>
                  {/* )} */}
                </TouchableOpacity>
              </View>
            }
          />
        </View>
      </View>
    </View>
  );
};
