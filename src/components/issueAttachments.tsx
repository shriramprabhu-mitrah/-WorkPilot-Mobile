import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Image,
  NativeModules,
  FlatList,
  Platform,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from '@react-native-vector-icons/ionicons';
import { pick, types } from '@react-native-documents/picker';
import ImagePicker from 'react-native-image-crop-picker';
import AppText from './common/AppText';
import PopupModel from './popupModel';
import DeleteColumnModal from './DeleteColumnModal';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { ThemeColors } from '../constants/Colors';
import { useAppDispatch, useAppSelector } from '../store';
import {
  Attachment,
  LocalAttachment,
  VideoAttachment,
} from '../types/attachment.type';
import {
  fetchUserStoryAttachments,
  uploadUserStoryAttachment,
  deleteUserStoryAttachment,
  fetchTaskAttachments,
  uploadTaskAttachment,
  deleteTaskAttachment,
} from '../store/comments_store/action/attachment.thunk';
import {
  addLocalVideo,
  removeLocalVideo,
} from '../store/comments_store/reducer/attachment.reducer';
import AttachmentsSkeleton from './skeleton/issueDetailSkeleton';
import { moderateScale } from '../utils/responsive';

const { DownloadModule } = NativeModules;

interface Props {
  colors: ThemeColors;
  projectId: string;
  userStoryId?: string;
  taskId?: string;
}

const getAttachmentIcon = (fileType?: string) => {
  const type = fileType?.toLowerCase();
  if (type?.startsWith('image')) return 'image-outline';
  if (type?.startsWith('video')) return 'videocam-outline';
  if (type === 'pdf' || type?.includes('pdf')) return 'document-text-outline';
  return 'document-attach-outline';
};

const getFileTypeLabel = (fileType?: string) => {
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
    Attachment | LocalAttachment | VideoAttachment | null
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

  const {
    userStoryAttachments,
    taskCommentAttachments,
    localVideos,
    loading,
    refreshing,
  } = useAppSelector((state: any) => state.attachments);

  useEffect(() => {
    if (!projectId) return;
    if (userStoryId) {
      dispatch(
        fetchUserStoryAttachments({ projectId, userStoryId, isInitial: true }),
      );
    }
  }, [dispatch, projectId, userStoryId]);

  useEffect(() => {
    if (!taskId || !projectId) return;
    dispatch(fetchTaskAttachments({ projectId, taskId, isInitial: true }));
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

  const removeLocalAttachment = useCallback((tempId: string) => {
    setLocalAttachments(prev => prev.filter(a => a.tempId !== tempId));
  }, []);

  const handleRemoveLocalVideo = useCallback(
    (id: string) => {
      dispatch(removeLocalVideo(id));
    },
    [dispatch],
  );

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
            dispatch(
              fetchTaskAttachments({ projectId, taskId, isInitial: false }),
            );
            return;
          }
        } else if (userStoryId && projectId) {
          result = await dispatch(
            uploadUserStoryAttachment({ projectId, userStoryId, file }),
          );
          if (uploadUserStoryAttachment.fulfilled.match(result)) {
            removeLocalAttachment(file.tempId);
            dispatch(
              fetchUserStoryAttachments({
                projectId,
                userStoryId,
                isInitial: false,
              }),
            );
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
    try {
      const media = await ImagePicker.openPicker({
        mediaType: 'any',
        cropping: false,
      });
      const isVideo = media.mime?.startsWith('video');
      const name =
        media.filename || `${isVideo ? 'video' : 'photo'}_${Date.now()}`;
      const type = media.mime || (isVideo ? 'video/mp4' : 'image/jpeg');

      if (isVideo) {
        dispatch(
          addLocalVideo({
            id: `${Date.now()}`,
            uri: media.path,
            original_filename: name,
            mime_type: type,
            file_size: media.size,
            type: 'video',
          }),
        );
        return;
      }

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
    } catch (error: any) {}
  }, [uploadFile, addLocalAttachment, dispatch]);

  const handleTakePhoto = useCallback(async () => {
    setMenuVisible(false);
    try {
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
    } catch (error: any) {}
  }, [uploadFile, addLocalAttachment]);

  const handleRecordVideo = useCallback(async () => {
    setMenuVisible(false);
    try {
      const video = await ImagePicker.openCamera({
        mediaType: 'video',
      });
      const name = video.filename || `video_${Date.now()}.mp4`;
      const type = video.mime || 'video/mp4';

      dispatch(
        addLocalVideo({
          id: `${Date.now()}`,
          uri: video.path,
          original_filename: name,
          mime_type: type,
          file_size: video.size,
          type: 'video',
        }),
      );
    } catch (error: any) {}
  }, [dispatch]);

  const ACCEPTED_MIME_TYPES = [
    'image/png',
    'image/jpeg',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'text/plain',
  ];

  const ACCEPTED_EXTENSIONS = [
    '.png',
    '.jpg',
    '.jpeg',
    '.pdf',
    '.docx',
    '.xlsx',
    '.zip',
    '.txt',
  ];

  const isAcceptedFile = (mimeType: string, fileName: string): boolean => {
    const lowerMime = mimeType?.toLowerCase() || '';
    const lowerName = fileName?.toLowerCase() || '';
    const mimeMatch = ACCEPTED_MIME_TYPES.includes(lowerMime);
    const extMatch = ACCEPTED_EXTENSIONS.some(ext => lowerName.endsWith(ext));
    return mimeMatch || extMatch;
  };

  const handleChooseFile = useCallback(async () => {
    setMenuVisible(false);
    try {
      const res = await pick({
        type: [
          types.images,
          types.pdf,
          types.docx,
          types.xlsx,
          types.zip,
          types.plainText,
        ],
        allowMultiSelection: false,
      });
      if (!res.length) return;
      const doc = res[0];

      if (!isAcceptedFile(doc.type || '', doc.name || '')) {
        Alert.alert(
          'Invalid File Type',
          'Only PNG, JPG/JPEG, PDF, DOCX, XLSX, ZIP, and TXT files are accepted.',
        );
        return;
      }

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
    } catch (error: any) {}
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
        dispatch(fetchTaskAttachments({ projectId, taskId, isInitial: false }));
      } else if (userStoryId && projectId) {
        await dispatch(
          deleteUserStoryAttachment({
            projectId,
            userStoryId,
            attachmentId: targetId,
          }),
        );
        dispatch(
          fetchUserStoryAttachments({
            projectId,
            userStoryId,
            isInitial: false,
          }),
        );
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
    item: Attachment | LocalAttachment | VideoAttachment,
  ): item is LocalAttachment => 'tempId' in item;

  const isVideoAttachment = (
    item: Attachment | LocalAttachment | VideoAttachment,
  ): item is VideoAttachment => 'uri' in item;

  const isAttachment = (
    item: Attachment | LocalAttachment | VideoAttachment,
  ): item is Attachment =>
    'id' in item && !('tempId' in item) && !('uri' in item);

  const getPreviewUrl = (
    item: Attachment | LocalAttachment | VideoAttachment,
  ): string | undefined => {
    let rawUri: string | undefined;
    if (isVideoAttachment(item)) rawUri = item.uri;
    else if (isLocalAttachment(item)) rawUri = item.localUri || item.url;
    else rawUri = item.url;

    if (!rawUri) return undefined;

    // Ensure Android local file paths contain the proper file protocol scheme
    if (
      Platform.OS === 'android' &&
      !rawUri.startsWith('http://') &&
      !rawUri.startsWith('https://') &&
      !rawUri.startsWith('file://') &&
      !rawUri.startsWith('content://')
    ) {
      return `file://${rawUri}`;
    }

    return rawUri;
  };

  const serverAttachments = isTask
    ? taskCommentAttachments
    : userStoryAttachments;

  const activeLocalAttachments = localAttachments.filter(
    l => l.status === 'failed',
  );

  const isAnyUploading = localAttachments.some(l => l.status === 'uploading');

  const mergedAttachments = [
    ...activeLocalAttachments,
    ...localVideos,
    ...serverAttachments,
  ].reverse();

  const showEmptyState =
    !loading && mergedAttachments.length === 0 && !isAnyUploading;

  const renderItem = ({
    item,
  }: {
    item: Attachment | LocalAttachment | VideoAttachment;
  }) => {
    const isLocal = isLocalAttachment(item);
    const isVideo = isVideoAttachment(item);
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
            {item.uploaded_by_name && !isLocal && !isVideo && (
              <AppText variant='caption' color={colors.textSecondary}>
                by {item.uploaded_by_name}
              </AppText>
            )}
          </View>
        </TouchableOpacity>

        <View className='flex-row items-center' style={{ gap: 8 }}>
          {!isVideo && (
            <TouchableOpacity
              onPress={() => {
                const downloadTarget = isAttachment(item)
                  ? item
                  : isLocal && item.serverId
                    ? { ...item, id: item.serverId }
                    : null;
                if (downloadTarget)
                  handleDownload(downloadTarget as Attachment);
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
          )}
          <TouchableOpacity
            onPress={() => {
              if (isVideo) {
                handleRemoveLocalVideo(item.id);
                return;
              }
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
          onPress={() => !isAnyUploading && !refreshing && setMenuVisible(true)}
          activeOpacity={0.7}
          disabled={isAnyUploading || refreshing}
          hitSlop={8}
        >
          {isAnyUploading ? (
            <ActivityIndicator size='small' color={colors.primary} />
          ) : (
            <Ionicons name='add-outline' size={24} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
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
        <View style={{ maxHeight: moderateScale(235) }}>
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
        onSelectRecordVideo={handleRecordVideo}
        onSelectFile={handleChooseFile}
      />

      {/* Preview Modal */}
      {previewAttachment && (
        <Modal
          visible
          transparent
          animationType='fade'
          onRequestClose={() => setPreviewAttachment(null)}
        >
          <View
            className='flex-1 items-center justify-center'
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.92)' }}
          >
            <TouchableOpacity
              className='absolute right-6 top-12 z-10'
              onPress={() => setPreviewAttachment(null)}
              hitSlop={12}
            >
              <Ionicons name='close' size={30} color='#FFFFFF' />
            </TouchableOpacity>

            {(() => {
              const url = getPreviewUrl(previewAttachment);
              const mime = previewAttachment.mime_type?.toLowerCase() || '';
              const filename =
                previewAttachment.original_filename?.toLowerCase() || '';

              const isImage =
                mime.startsWith('image') ||
                /\.(jpg|jpeg|png|gif|webp|bmp|heic)$/i.test(filename);

              const isVideo =
                mime.startsWith('video') ||
                (previewAttachment as any).type === 'video' ||
                /\.(mp4|mov|m4v|3gp|mkv|webm|avi)$/i.test(filename);

              if (isImage && url) {
                return (
                  <Image
                    source={{ uri: url }}
                    style={{ width: '90%', height: '70%' }}
                    resizeMode='contain'
                  />
                );
              }

              if (isVideo && url) {
                const videoHtml = `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                    <style>
                      * { margin: 0; padding: 0; box-sizing: border-box; }
                      html, body {
                        width: 100%;
                        height: 100%;
                        background-color: #000000;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        overflow: hidden;
                      }
                      video {
                        width: 100%;
                        height: 100%;
                        max-width: 100%;
                        max-height: 100%;
                        object-fit: contain;
                        background-color: #000000;
                      }
                    </style>
                  </head>
                  <body>
                    <video 
                      src="${url}" 
                      controls 
                      autoplay 
                      playsinline 
                      webkit-playsinline
                      controlsList="nodownload"
                    >
                      Your browser does not support video playback.
                    </video>
                  </body>
                  </html>
                `;

                return (
                  <View
                    style={{
                      width: '90%',
                      height: '70%',
                      backgroundColor: '#000000',
                      borderRadius: 12,
                      overflow: 'hidden',
                    }}
                  >
                    <WebView
                      source={{ html: videoHtml }}
                      originWhitelist={['*']}
                      allowFileAccess={true}
                      allowFileAccessFromFileURLs={true}
                      allowUniversalAccessFromFileURLs={true}
                      allowsFullscreenVideo={true}
                      allowsInlineMediaPlayback={true}
                      mediaPlaybackRequiresUserAction={false}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#000000',
                      }}
                    />
                  </View>
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
