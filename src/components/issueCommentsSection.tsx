import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import Avatar from './Avatar';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { ThemeColors } from '../constants/Colors';
import { useAppDispatch } from '../store';
import {
  fetchTaskCommentReplies,
  fetchUserStoryCommentReplies,
} from '../store/comments_store/action/comments.thunk';
import { CommentItem } from '../types/comments.type';
import {
  CommentsSectionSkeleton,
} from './skeleton/issueDetailSkeleton';
import { renderParsedHtml } from '../utils/htmlParser';

interface Props {
  colors: ThemeColors;
  commentsLoading: boolean;
  apiComments: CommentItem[];
  editingCommentId: string | null;
  onStartEdit: (commentId: string, text: string) => void;
  onDeleteComment: (commentId: string) => Promise<void> | void;
  onReply?: (commentId: string) => void;
  onRetry?: (commentId: string) => void;
  expandedCommentIds?: Record<string, boolean>;
  onToggleExpand?: (commentId: string) => void;
  taskId?: string;
  userStoryId?: string;
  projectId?: string;
}

export const IssueCommentsSection: React.FC<Props> = ({
  colors,
  commentsLoading,
  apiComments,
  editingCommentId,
  onStartEdit,
  onDeleteComment,
  onReply,
  onRetry,
  expandedCommentIds = {},
  onToggleExpand,
  taskId,
  userStoryId,
  projectId,
}) => {
  const dispatch = useAppDispatch();
  const { layout } = useAuthLayout();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null,
  );
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const fetchedReplyRefs = useRef<Set<string>>(new Set());
  const lastTaskIdRef = useRef<string | null>(null);
  const lastUserStoryIdRef = useRef<string | null>(null);

  // Build a flattened thread per root comment using parent_comment_id.
  const { roots, repliesByRoot } = useMemo(() => {
    const flat = (apiComments || []).filter(item => !item.is_deleted);
    const byId = new Map<string, CommentItem>(
      flat.map(item => [item.id, item]),
    );

    const rootIdOf = (startId: string): string => {
      let currentId = startId;
      const seen = new Set<string>([currentId]);
      while (true) {
        const current = byId.get(currentId);
        const pid = current?.parent_comment_id || null;
        if (!pid || !byId.has(pid) || seen.has(pid)) break;
        seen.add(pid);
        currentId = pid;
      }
      return currentId;
    };

    const rootList: CommentItem[] = [];
    const repliesMap: Record<string, CommentItem[]> = {};

    flat.forEach(item => {
      const rid = rootIdOf(item.id);
      if (rid === item.id) {
        rootList.push(item);
      } else {
        if (!repliesMap[rid]) repliesMap[rid] = [];
        repliesMap[rid].push(item);
      }
    });

    return {
      roots: rootList,
      repliesByRoot: repliesMap,
    };
  }, [apiComments]);

  useEffect(() => {
    const activeId = taskId || userStoryId;
    if (!activeId) {
      return;
    }

    if (taskId && lastTaskIdRef.current !== taskId) {
      lastTaskIdRef.current = taskId;
      fetchedReplyRefs.current.clear();
    }
    if (userStoryId && lastUserStoryIdRef.current !== userStoryId) {
      lastUserStoryIdRef.current = userStoryId;
      fetchedReplyRefs.current.clear();
    }

    const allComments = apiComments || [];
    const rootsWithReplies = allComments.filter(
      c => (c.replies_count ?? 0) > 0 && !c.is_deleted,
    );

    rootsWithReplies.forEach(comment => {
      if (!fetchedReplyRefs.current.has(comment.id)) {
        fetchedReplyRefs.current.add(comment.id);
        if (taskId) {
          dispatch(
            fetchTaskCommentReplies({
              taskId,
              parentCommentId: comment.id,
            }),
          );
        } else if (userStoryId && projectId) {
          dispatch(
            fetchUserStoryCommentReplies({
              projectId,
              userStoryId,
              commentId: comment.id,
            }),
          );
        }
      }
    });
  }, [taskId, userStoryId, projectId, apiComments, dispatch]);

  const handleOpenDeleteModal = (commentId: string) => {
    setSelectedCommentId(commentId);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCommentId) {
      return;
    }
    const targetId = selectedCommentId;

    setIsDeleteModalVisible(false);
    setSelectedCommentId(null);
    setDeletingId(targetId);

    try {
      await onDeleteComment(targetId);
    } catch (error) {
      console.error('Delete action failed:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const renderCommentRow = (item: CommentItem & { is_pending?: boolean; is_failed?: boolean }) => {
    // Render "Sending..." state for pending optimistic comments
    if (item.is_pending) {
      const authorName = item.full_name || item.user_name || 'User';
      const avatarInitials = authorName
        .split(' ')
        .filter(Boolean)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();
      const commentText = item.content || '';

      return (
        <View key={item.id} className='flex-row' style={[{ gap: 12 }, styles.pendingContainer]}>
          <Avatar
            size='medium'
            initials={avatarInitials}
            color={colors.primary}
          />
          <View className='flex-1' style={{ gap: 6 }}>
            <View className='flex-row items-center' style={{ gap: 8 }}>
              <AppText variant='body' color={colors.text} className='font-bold'>
                {authorName}
              </AppText>
            </View>
            <View style={{ flex: 1 }}>
              {renderParsedHtml(commentText, {
                color: colors.textSecondary,
                lineHeight: 22,
              })}
            </View>
            <View className='flex-row items-center' style={{ gap: 6 }}>
              <ActivityIndicator size='small' color={colors.primary} />
              <AppText
                variant='caption'
                color={colors.primary}
                className='font-medium'
              >
                Sending...
              </AppText>
            </View>
          </View>
        </View>
      );
    }

    // Render "Failed to send" state with Retry button
    if ((item as any).is_failed) {
      const authorName = item.full_name || item.user_name || 'User';
      const avatarInitials = authorName
        .split(' ')
        .filter(Boolean)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();
      const commentText = item.content || '';

      return (
        <View key={item.id} className='flex-row' style={{ gap: 12 }}>
          <Avatar
            size='medium'
            initials={avatarInitials}
            color={colors.error || '#FF3B30'}
          />
          <View className='flex-1' style={{ gap: 6 }}>
            <View className='flex-row items-center' style={{ gap: 8 }}>
              <AppText variant='body' color={colors.text} className='font-bold'>
                {authorName}
              </AppText>
            </View>
            <View style={{ flex: 1 }}>
              {renderParsedHtml(commentText, {
                color: colors.text,
                lineHeight: 22,
              })}
            </View>
            <View className='flex-row items-center' style={{ gap: 12 }}>
              <View className='flex-row items-center' style={{ gap: 4 }}>
                <Ionicons
                  name='alert-circle-outline'
                  size={14}
                  color={colors.error || '#FF3B30'}
                />
                <AppText
                  variant='caption'
                  color={colors.error || '#FF3B30'}
                  className='font-medium'
                >
                  Failed to send
                </AppText>
              </View>
              {onRetry && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onRetry(item.id)}
                  className='flex-row items-center'
                  style={{ gap: 4 }}
                >
                  <Ionicons
                    name='reload-outline'
                    size={14}
                    color={colors.primary}
                  />
                  <AppText
                    variant='caption'
                    color={colors.primary}
                    className='font-semibold'
                  >
                    Retry
                  </AppText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      );
    }

    const authorName = item.full_name || item.user_name || 'User';
    const avatarInitials = authorName
      .split(' ')
      .filter(Boolean)
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();
    const commentText = item.content || '';
    const isDeletingThis = deletingId === item.id;

    return (
      <View key={item.id} className='flex-row' style={{ gap: 12 }}>
        <Avatar
          size='medium'
          initials={avatarInitials}
          color={colors.primary}
        />
        <View className='flex-1' style={{ gap: 6 }}>
          <View className='flex-row items-center' style={{ gap: 8 }}>
            <AppText variant='body' color={colors.text} className='font-bold'>
              {authorName}
            </AppText>
            {item.created_at && (
              <AppText variant='caption' color={colors.textSecondary}>
                {new Date(item.created_at).toLocaleString()}
              </AppText>
            )}
          </View>

          {/* Cleaned text without raw HTML tags */}
          <View style={{ flex: 1 }}>
            {renderParsedHtml(commentText, {
              color: colors.text,
              lineHeight: 22,
            })}
          </View>

          <View
            className='flex-row items-center justify-between'
            style={{ gap: 12 }}
          >
            <View className='flex-row items-center' style={{ gap: 12 }}>
              {onReply && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onReply(item.id)}
                >
                  <AppText
                    variant='caption'
                    color={colors.primary}
                    className='font-semibold'
                  >
                    Reply
                  </AppText>
                </TouchableOpacity>
              )}
              {(item.replies_count ?? 0) > 0 && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onToggleExpand?.(item.id)}
                >
                  <AppText
                    variant='caption'
                    color={colors.textSecondary}
                    className='font-medium'
                  >
                    {expandedCommentIds[item.id]
                      ? 'Hide replies'
                      : `View ${item.replies_count} more ${
                          item.replies_count === 1 ? 'reply' : 'replies'
                        }`}
                  </AppText>
                </TouchableOpacity>
              )}
            </View>

            <View className='flex-row items-center' style={{ gap: 14 }}>
              <TouchableOpacity
                disabled={isDeletingThis}
                onPress={() => {
                  onStartEdit(item.id, commentText);
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
        </View>
      </View>
    );
  };

  const renderRoot = (item: CommentItem): React.ReactElement => {
    const replies = repliesByRoot[item.id] || [];
    const hasReplies = replies.length > 0;
    const isExpanded = Boolean(expandedCommentIds[item.id]);

    return (
      <View key={item.id} style={{ gap: 8 }}>
        {renderCommentRow(item)}

        {hasReplies && isExpanded && (
          <View className='ml-8' style={{ gap: 12 }}>
            <View
              className='border-l-2 pl-4'
              style={{ borderColor: colors.border, gap: 12 }}
            >
              {replies.map(reply => renderCommentRow(reply))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View
      className='mt-3'
      style={{
        backgroundColor: colors.card || colors.surface,
        paddingHorizontal: layout.paddingHorizontal,
        paddingVertical: layout.sectionGap,
        minHeight: roots.length > 0 ? undefined : 150,
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
        <CommentsSectionSkeleton />
      ) : roots.length > 0 ? (
        <ScrollView
          style={{ maxHeight: 400 }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          <View style={{ gap: 24 }}>{roots.map(root => renderRoot(root))}</View>
        </ScrollView>
      ) : (
        <View className='w-full flex-1 items-center justify-center py-6'>
          <AppText variant='body' color={colors.textSecondary}>
            No comments yet.
          </AppText>
        </View>
      )}

      {/* Delete Confirmation Modal */}
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

const styles = StyleSheet.create({
  pendingContainer: {
    opacity: 0.7,
  },
});
