import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import Avatar from './Avatar';
import { useAuthLayout } from '../hooks/useAuthLayout';

interface Props {
  hooks: any;
  onDeleteComment?: (commentId: string) => Promise<void> | void;
}

export const IssueCommentsSection: React.FC<Props> = ({
  hooks,
  onDeleteComment,
}) => {
  // 1. ALL Hooks must be declared at the top level of the component in fixed order
  const { layout } = useAuthLayout();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null,
  );
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  // 2. Destructure props and custom hook objects after standard React hooks
  const {
    colors,
    commentsLoading,
    apiComments,
    editingCommentId,
    setEditingCommentId,
    setComment,
    handleDeleteComment: hookDeleteComment,
  } = hooks;

  const deleteAction = onDeleteComment || hookDeleteComment;

  const handleOpenDeleteModal = (commentId: string) => {
    setSelectedCommentId(commentId);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCommentId) return;
    const targetId = selectedCommentId;

    setIsDeleteModalVisible(false);
    setSelectedCommentId(null);
    setDeletingId(targetId);

    try {
      if (deleteAction) {
        await deleteAction(targetId);
      }
    } catch (error) {
      console.error('Delete action failed:', error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <View
      className='mt-3'
      style={{
        backgroundColor: colors.card || colors.surface,
        paddingHorizontal: layout.paddingHorizontal,
        paddingVertical: layout.sectionGap,
      }}
    >
      <AppText
        variant='bodyLarge'
        color={colors.text}
        className='mb-3 font-bold'
      >
        Comments
      </AppText>

      {commentsLoading ? (
        <ActivityIndicator
          size='small'
          color={colors.primary}
          className='my-4'
        />
      ) : apiComments && apiComments.length > 0 ? (
        // Added ScrollView with a maximum height so it becomes scrollable when comments grow long
        <ScrollView
          style={{ maxHeight: 300 }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {apiComments.map((item: any) => {
            const authorName =
              item.full_name ||
              item.user_name ||
              item.user?.name ||
              item.author ||
              'User';
            const avatarInitials = authorName
              .split(' ')
              .filter(Boolean)
              .map((n: string) => n[0])
              .join('')
              .toUpperCase();
            const commentText = item.content || item.comment || item.text || '';
            const repliesCount = item.replies_count ?? 0;
            const isDeletingThis = deletingId === item.id;

            return (
              <View key={item.id} className='mb-6 flex-row' style={{ gap: 12 }}>
                <Avatar
                  size='medium'
                  initials={avatarInitials}
                  color={colors.primary}
                />
                <View className='flex-1' style={{ gap: 6 }}>
                  <View className='flex-row items-center' style={{ gap: 8 }}>
                    <AppText
                      variant='body'
                      color={colors.text}
                      className='font-bold'
                    >
                      {authorName}
                    </AppText>
                  </View>

                  <View
                    className='flex-row items-center justify-between rounded-xl px-4 py-3'
                    style={{ backgroundColor: colors.surface }}
                  >
                    <AppText
                      variant='body'
                      color={colors.text}
                      className='flex-1 leading-6'
                    >
                      {commentText}
                    </AppText>
                    <View
                      className='ml-2 flex-row items-center'
                      style={{ gap: 12 }}
                    >
                      <TouchableOpacity
                        disabled={isDeletingThis}
                        onPress={() => {
                          setEditingCommentId(item.id);
                          setComment(commentText);
                        }}
                      >
                        <Ionicons
                          name='pencil-outline'
                          size={16}
                          color={
                            editingCommentId === item.id
                              ? colors.primary
                              : colors.textSecondary
                          }
                        />
                      </TouchableOpacity>
                      {isDeletingThis ? (
                        <ActivityIndicator size='small' color={colors.error} />
                      ) : (
                        <TouchableOpacity
                          onPress={() => handleOpenDeleteModal(item.id)}
                        >
                          <Ionicons
                            name='trash-outline'
                            size={16}
                            color={colors.error || '#FF3B30'}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    className='mt-1 flex-row items-center self-start'
                    style={{ gap: 6 }}
                  >
                    <Ionicons
                      name='return-down-back-outline'
                      size={14}
                      color={colors.textSecondary}
                    />
                    <AppText variant='caption' color={colors.textSecondary}>
                      Reply {repliesCount}
                    </AppText>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <AppText variant='body' color={colors.textSecondary}>
          No comments yet.
        </AppText>
      )}

      <Modal
        visible={isDeleteModalVisible}
        transparent
        animationType='fade'
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View
          className='flex-1 items-center justify-center px-4'
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <View
            className='w-full max-w-sm rounded-2xl p-6'
            style={{ backgroundColor: colors.card || colors.surface }}
          >
            <AppText
              variant='bodyLarge'
              color={colors.text}
              className='mb-2 font-bold'
            >
              Delete Comment
            </AppText>

            <AppText
              variant='body'
              color={colors.textSecondary}
              className='mb-6'
            >
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </AppText>

            <View className='flex-row justify-end' style={{ gap: 12 }}>
              <TouchableOpacity
                className='rounded-lg px-4 py-2.5'
                style={{ backgroundColor: colors.surface }}
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <AppText variant='body' color={colors.text}>
                  Cancel
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                className='rounded-lg px-4 py-2.5'
                style={{ backgroundColor: colors.error }}
                onPress={handleConfirmDelete}
              >
                <AppText
                  variant='body'
                  color={colors.white}
                  className='font-bold'
                >
                  Delete
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
