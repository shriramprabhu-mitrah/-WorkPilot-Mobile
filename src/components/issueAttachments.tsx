import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  NativeModules,
  FlatList,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { pick, types } from '@react-native-documents/picker';
import AppText from './common/AppText';
import PopupModel from './popupModel';
import DeleteColumnModal from './DeleteColumnModal';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { ThemeColors } from '../constants/Colors';
import { useAppDispatch, useAppSelector } from '../store';
import { Attachment, LocalAttachment } from '../types/attachment.type';
import {
  fetchUserStoryAttachments,
  uploadUserStoryAttachment,
  deleteUserStoryAttachment,
  fetchTaskAttachments,
  uploadTaskAttachment,
  deleteTaskAttachment,
} from '../store/comments_store/action/attachment.thunk';
import AttachmentsSkeleton from './skeleton/issueDetailSkeleton';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';

const { DownloadModule } = NativeModules;

interface Props {
  colors: ThemeColors;
  projectId: string;
  userStoryId?: string;
  taskId?: string;
}

const getAttachmentIcon = (fileType: string) => {
  const type = fileType?.toLowerCase();
  if (type?.startsWith('image')) return 'image-outline';
  if (type?.startsWith('video')) return 'videocam-outline';
  if (type === 'pdf' || type?.includes('pdf')) return 'document-text-outline';
  return 'document-attach-outline';
};

const getFileTypeLabel = (fileType: string) => {
  const type = fileType?.toLowerCase();
  if (type?.startsWith('image')) return 'Image';
  if (type?.startsWith('video')) return 'Video';
  if (type === 'application/pdf') return 'PDF';
  if (type?.includes('word') || type?.includes('doc')) return 'Document';
  if (type?.includes('excel') || type?.includes('sheet')) return 'Spreadsheet';
  if (type?.includes('powerpoint') || type?.includes('presentation'))
    return 'Presentation';
  return 'File';
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (isoString?: string): string => {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

export const IssueAttachments: React.FC<Props> = ({
  colors,
  projectId,
  userStoryId,
  taskId,
}) => {
  const dispatch = useAppDispatch();
  const { layout } = useAuthLayout();

  const [menuVisible, setMenuVisible] = useState(false);
  const [localAttachments, setLocalAttachments] = useState<LocalAttachment[]>(
    [],
  );
  const [previewAttachment, setPreviewAttachment] = useState<
    Attachment | LocalAttachment | null
  >(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingAttachment, setDeletingAttachment] =
    useState<Attachment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const isTask = Boolean(taskId);
  const uploadCounterRef = useRef(0);
  const localAttachmentsRef = useRef<LocalAttachment[]>([]);
  localAttachmentsRef.current = localAttachments;

  const { userStoryAttachments, taskCommentAttachments, loading } =
    useAppSelector((state: any) => state.attachments);

  useEffect(() => {
    if (!projectId) return;
    if (userStoryId) {
      dispatch(fetchUserStoryAttachments({ projectId, userStoryId }));
    }
  }, [dispatch, projectId, userStoryId]);

  useEffect(() => {
    if (!taskId || !projectId) return;
    dispatch(fetchTaskAttachments({ projectId, taskId }));
  }, [dispatch, taskId, projectId]);

  const generateTempId = () => {
    uploadCounterRef.current += 1;
    return `temp-${Date.now()}-${uploadCounterRef.current}`;
  };

  const addLocalAttachment = useCallback(
    (file: {
      uri: string;
      name: string;
      type: string;
      size?: number;
    }): string => {
      const tempId = generateTempId();
      const newLocal: LocalAttachment = {
        tempId,
        original_filename: file.name,
        localUri: file.uri,
        mime_type: file.type,
        file_size: file.size,
        status: 'uploading',
      };
      setLocalAttachments(prev => [...prev, newLocal]);
      return tempId;
    },
    [],
  );

  const updateLocalAttachment = useCallback(
    (tempId: string, updates: Partial<LocalAttachment>) => {
      setLocalAttachments(prev =>
        prev.map(a => (a.tempId === tempId ? { ...a, ...updates } : a)),
      );
    },
    [],
  );

  // Remove local attachment once successfully uploaded so it doesn't duplicate with Redux state
  const removeLocalAttachment = useCallback((tempId: string) => {
    setLocalAttachments(prev => prev.filter(a => a.tempId !== tempId));
  }, []);

  const uploadFile = useCallback(
    async (file: {
      uri: string;
      name: string;
      type: string;
      size?: number;
      tempId: string;
    }) => {
      try {
        let result;
        if (isTask && taskId && projectId) {
          result = await dispatch(
            uploadTaskAttachment({ projectId, taskId, file }),
          );
          if (uploadTaskAttachment.fulfilled.match(result)) {
            removeLocalAttachment(file.tempId);
            dispatch(fetchTaskAttachments({ projectId, taskId }));
            return;
          }
        } else if (userStoryId && projectId) {
          result = await dispatch(
            uploadUserStoryAttachment({ projectId, userStoryId, file }),
          );
          if (uploadUserStoryAttachment.fulfilled.match(result)) {
            removeLocalAttachment(file.tempId);
            dispatch(fetchUserStoryAttachments({ projectId, userStoryId }));
            return;
          }
        }
        updateLocalAttachment(file.tempId, {
          status: 'failed',
          error: 'Upload failed',
        });
      } catch {
        updateLocalAttachment(file.tempId, {
          status: 'failed',
          error: 'Upload failed',
        });
      }
    },
    [
      dispatch,
      isTask,
      taskId,
      userStoryId,
      projectId,
      removeLocalAttachment,
      updateLocalAttachment,
    ],
  );

  const handleChoosePhotoOrVideo = useCallback(async () => {
    setMenuVisible(false);
    const ImagePicker = (await import('react-native-image-crop-picker'))
      .default;
    const media = await ImagePicker.openPicker({
      mediaType: 'any',
      cropping: false,
    });
    const isVideo = media.mime?.startsWith('video');
    const name =
      media.filename || `${isVideo ? 'video' : 'photo'}_${Date.now()}`;
    const type = media.mime || (isVideo ? 'video/*' : 'image/*');

    const tempId = addLocalAttachment({
      uri: media.path,
      name,
      type,
      size: media.size,
    });
    await uploadFile({
      uri: media.path,
      name,
      type,
      size: media.size,
      tempId,
    });
  }, [uploadFile, addLocalAttachment]);

  const handleTakePhoto = useCallback(async () => {
    setMenuVisible(false);
    const ImagePicker = (await import('react-native-image-crop-picker'))
      .default;
    const image = await ImagePicker.openCamera({
      mediaType: 'photo',
      cropping: true,
      compressImageQuality: 0.8,
    });
    const name = `photo_${Date.now()}.jpg`;

    const tempId = addLocalAttachment({
      uri: image.path,
      name,
      type: 'image/jpeg',
      size: image.size,
    });
    await uploadFile({
      uri: image.path,
      name,
      type: 'image/jpeg',
      size: image.size,
      tempId,
    });
  }, [uploadFile, addLocalAttachment]);

  const handleChooseFile = useCallback(async () => {
    setMenuVisible(false);
    const res = await pick({
      type: [types.allFiles],
      allowMultiSelection: false,
    });
    if (!res.length) return;
    const doc = res[0];
    const name = doc.name || `document_${Date.now()}`;
    const type = doc.type || 'application/octet-stream';

    const tempId = addLocalAttachment({
      uri: doc.uri,
      name,
      type,
      size: doc.size ?? undefined,
    });
    await uploadFile({
      uri: doc.uri,
      name,
      type,
      size: doc.size ?? undefined,
      tempId,
    });
  }, [uploadFile, addLocalAttachment]);

  const handleDownload = useCallback(async (attachment: Attachment) => {
    try {
      setDownloadingId(attachment.id);
      if (!attachment.url || !DownloadModule?.downloadFile) return;
      await DownloadModule.downloadFile(
        attachment.url,
        attachment.original_filename || `file_${Date.now()}`,
      );
    } finally {
      setDownloadingId(null);
    }
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalVisible(false);
    setDeletingAttachment(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deletingAttachment) return;
    const targetId = deletingAttachment.id;
    closeDeleteModal();
    try {
      setDeletingId(targetId);
      if (isTask && taskId && projectId) {
        await dispatch(
          deleteTaskAttachment({ projectId, taskId, attachmentId: targetId }),
        );
        dispatch(fetchTaskAttachments({ projectId, taskId }));
      } else if (userStoryId && projectId) {
        await dispatch(
          deleteUserStoryAttachment({
            projectId,
            userStoryId,
            attachmentId: targetId,
          }),
        );
        dispatch(fetchUserStoryAttachments({ projectId, userStoryId }));
      }
    } finally {
      setDeletingId(null);
    }
  }, [
    dispatch,
    deletingAttachment,
    isTask,
    taskId,
    userStoryId,
    projectId,
    closeDeleteModal,
  ]);

  const isLocalAttachment = (
    item: Attachment | LocalAttachment,
  ): item is LocalAttachment => 'tempId' in item;

  const isAttachment = (
    item: Attachment | LocalAttachment,
  ): item is Attachment => 'id' in item && !('tempId' in item);

  const getPreviewUrl = (
    item: Attachment | LocalAttachment,
  ): string | undefined =>
    isLocalAttachment(item) ? item.localUri || item.url : item.url;

  const serverAttachments = isTask
    ? taskCommentAttachments
    : userStoryAttachments;

  // Only keep local attachments that failed (uploading ones are hidden completely)
  const activeLocalAttachments = localAttachments.filter(
    l => l.status === 'failed',
  );

  const isAnyUploading = localAttachments.some(l => l.status === 'uploading');

  const mergedAttachments = [
    ...activeLocalAttachments,
    ...serverAttachments,
  ].reverse();

  const showEmptyState =
    !loading && mergedAttachments.length === 0 && !isAnyUploading;

  const renderItem = ({ item }: { item: Attachment | LocalAttachment }) => {
    const isLocal = isLocalAttachment(item);
    const fileLabel = getFileTypeLabel(item.mime_type);
    const fileSize = formatFileSize(item.file_size);
    const uploadDate = formatDate(item.uploaded_at);
    const isFailed = isLocal && item.status === 'failed';
    const serverId = isLocal ? item.serverId : item.id;
    const isDeletingThis = !!serverId && deletingId === serverId;
    const isDownloadingThis = !!serverId && downloadingId === serverId;

    return (
      <View
        className='flex-row items-center justify-between rounded-xl'
        style={{
          backgroundColor: colors.card || colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 12,
          marginBottom: layout.elementGap,
          minHeight: 70,
        }}
      >
        <TouchableOpacity
          className='flex-row items-center'
          style={{ gap: 12, flex: 1 }}
          onPress={() => setPreviewAttachment(item)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={getAttachmentIcon(item.mime_type)}
            size={32}
            color={colors.primary}
          />
          <View style={{ flex: 1 }}>
            <AppText
              variant='body'
              color={colors.text}
              className='font-medium'
              numberOfLines={1}
            >
              {item.original_filename}
            </AppText>
            <View className='flex-row items-center' style={{ gap: 4 }}>
              {fileLabel && (
                <AppText variant='caption' color={colors.textSecondary}>
                  {fileLabel}
                </AppText>
              )}
              {fileSize && (
                <AppText variant='caption' color={colors.textSecondary}>
                  {fileLabel ? ' · ' : ''}
                  {fileSize}
                </AppText>
              )}
              {uploadDate && (
                <AppText variant='caption' color={colors.textSecondary}>
                  {' · '}
                  {uploadDate}
                </AppText>
              )}
            </View>
            {isFailed && (
              <AppText variant='caption' color={colors.error}>
                {item.error || 'Upload failed'}
              </AppText>
            )}
            {item.uploaded_by_name && !isLocal && (
              <AppText variant='caption' color={colors.textSecondary}>
                by {item.uploaded_by_name}
              </AppText>
            )}
          </View>
        </TouchableOpacity>

        <View className='flex-row items-center' style={{ gap: 8 }}>
          <TouchableOpacity
            onPress={() => {
              const downloadTarget = isAttachment(item)
                ? item
                : isLocal && item.serverId
                  ? { ...item, id: item.serverId }
                  : null;
              if (downloadTarget) handleDownload(downloadTarget as Attachment);
            }}
            activeOpacity={0.7}
            disabled={isDownloadingThis}
            hitSlop={8}
          >
            {isDownloadingThis ? (
              <ActivityIndicator size='small' color={colors.primary} />
            ) : (
              <Ionicons
                name='download-outline'
                size={20}
                color={colors.primary}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              const targetAttachment = isAttachment(item)
                ? item
                : isLocal && item.serverId
                  ? ({ ...item, id: item.serverId } as Attachment)
                  : null;
              if (targetAttachment) {
                setDeletingAttachment(targetAttachment);
                setDeleteModalVisible(true);
              }
            }}
            activeOpacity={0.7}
            disabled={isDeletingThis}
            hitSlop={8}
          >
            {isDeletingThis ? (
              <ActivityIndicator
                size='small'
                color={colors.error || '#FF3B30'}
              />
            ) : (
              <Ionicons
                name='trash-outline'
                size={20}
                color={colors.error || '#FF3B30'}
              />
            )}
          </TouchableOpacity>
        </View>
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
      }}
    >
      <View className='mb-3 flex-row items-center justify-between'>
        <AppText variant='bodyLarge' color={colors.text} className='font-bold'>
          Attachments
        </AppText>
        <TouchableOpacity
          onPress={() => !isAnyUploading && setMenuVisible(true)}
          activeOpacity={0.7}
          disabled={isAnyUploading}
          hitSlop={8}
        >
          {isAnyUploading ? (
            <ActivityIndicator size='small' color={colors.primary} />
          ) : (
            <MaterialDesignIcons
              name='upload-outline'
              size={24}
              color={colors.primary}
            />
          )}
        </TouchableOpacity>
      </View>

      {loading && localAttachments.length === 0 ? (
        <AttachmentsSkeleton />
      ) : showEmptyState ? (
        <View className='w-full items-center justify-center py-6'>
          <Ionicons
            name='document-attach-outline'
            size={48}
            color={colors.textSecondary}
          />
          <AppText
            variant='body'
            color={colors.textSecondary}
            className='mt-2 text-center'
          >
            No attachments yet.
          </AppText>
        </View>
      ) : (
        /* Fixed height container wrapping the FlatList */
        <View style={{ height: 300 }}>
          <FlatList
            data={mergedAttachments}
            keyExtractor={item =>
              isLocalAttachment(item) ? item.tempId : item.id
            }
            renderItem={renderItem}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          />
        </View>
      )}

      <PopupModel
        visible={menuVisible}
        mode='camera'
        title='Add Attachment'
        onClose={() => setMenuVisible(false)}
        onSelectGallery={handleChoosePhotoOrVideo}
        onSelectCamera={handleTakePhoto}
        onSelectFile={handleChooseFile}
      />

      {previewAttachment && (
        <Modal
          visible
          transparent
          animationType='fade'
          onRequestClose={() => setPreviewAttachment(null)}
        >
          <View
            className='flex-1 items-center justify-center'
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
          >
            <TouchableOpacity
              className='absolute right-6 top-12 z-10'
              onPress={() => setPreviewAttachment(null)}
              hitSlop={10}
            >
              <Ionicons name='close' size={28} color='#FFFFFF' />
            </TouchableOpacity>
            {(() => {
              const url = getPreviewUrl(previewAttachment);
              const isImage = previewAttachment.mime_type?.startsWith('image');
              if (isImage && url) {
                return (
                  <Image
                    source={{ uri: url }}
                    style={{ width: '90%', height: '70%' }}
                    resizeMode='contain'
                  />
                );
              }
              return (
                <View className='items-center' style={{ gap: 16 }}>
                  <Ionicons
                    name={getAttachmentIcon(previewAttachment.mime_type)}
                    size={64}
                    color='#FFFFFF'
                  />
                  <AppText
                    variant='bodyLarge'
                    color='#FFFFFF'
                    className='font-bold'
                  >
                    {previewAttachment.original_filename}
                  </AppText>
                  {previewAttachment.file_size ? (
                    <AppText variant='body' color='#CCCCCC'>
                      {formatFileSize(previewAttachment.file_size)}
                    </AppText>
                  ) : null}
                </View>
              );
            })()}
          </View>
        </Modal>
      )}

      <DeleteColumnModal
        visible={deleteModalVisible}
        columnTitle={deletingAttachment?.original_filename || 'attachment'}
        colors={colors}
        onClose={closeDeleteModal}
        onDelete={confirmDelete}
      />
    </View>
  );
};

export default IssueAttachments;
