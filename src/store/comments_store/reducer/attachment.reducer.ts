import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AttachmentState,
  Attachment,
  VideoAttachment,
  GetUserStoryAttachmentsParams,
  GetUserStoryAttachmentsResponse,
  UploadUserStoryAttachmentResponse,
  DeleteUserStoryAttachmentResponse,
  GetTaskCommentAttachmentsParams,
  GetTaskCommentAttachmentsResponse,
  UploadTaskCommentAttachmentResponse,
  DeleteTaskCommentAttachmentResponse,
} from '../../../types/attachment.type';
import {
  fetchUserStoryAttachments,
  uploadUserStoryAttachment,
  deleteUserStoryAttachment,
  downloadUserStoryAttachment,
  fetchTaskAttachments,
  uploadTaskAttachment,
  deleteTaskAttachment,
  downloadTaskAttachment,
} from '../action/attachment.thunk';

const initialState: AttachmentState = {
  userStoryAttachments: [],
  taskCommentAttachments: [],
  localVideos: [],
  loading: false,
  uploading: false,
  deleting: false,
  downloading: false,
  refreshing: false,
  error: null,
};

const attachmentSlice = createSlice({
  name: 'attachments',
  initialState,
  reducers: {
    clearAttachmentsState: state => {
      state.userStoryAttachments = [];
      state.taskCommentAttachments = [];
      state.localVideos = [];
      state.loading = false;
      state.uploading = false;
      state.deleting = false;
      state.downloading = false;
      state.refreshing = false;
      state.error = null;
    },
    clearUserStoryAttachments: state => {
      state.userStoryAttachments = [];
    },
    clearTaskCommentAttachments: state => {
      state.taskCommentAttachments = [];
    },
    addLocalVideo: (state, action: PayloadAction<VideoAttachment>) => {
      state.localVideos.push(action.payload);
    },
    removeLocalVideo: (state, action: PayloadAction<string>) => {
      state.localVideos = state.localVideos.filter(
        v => v.id !== action.payload,
      );
    },
    clearLocalVideos: state => {
      state.localVideos = [];
    },
  },
  extraReducers: builder => {
    builder
      // ── Fetch User Story Attachments ──
      .addCase(fetchUserStoryAttachments.pending, (state, action) => {
        if (action.meta?.arg?.isInitial) {
          state.loading = true;
        } else {
          state.refreshing = true;
        }
        state.error = null;
      })
      .addCase(
        fetchUserStoryAttachments.fulfilled,
        (
          state,
          action: PayloadAction<
            GetUserStoryAttachmentsResponse,
            string,
            { arg: GetUserStoryAttachmentsParams }
          >,
        ) => {
          if (action.meta?.arg?.isInitial) {
            state.loading = false;
          } else {
            state.refreshing = false;
          }
          const incoming = action.payload?.data || [];
          state.userStoryAttachments = incoming;
        },
      )
      .addCase(fetchUserStoryAttachments.rejected, (state, action) => {
        if (action.meta?.arg?.isInitial) {
          state.loading = false;
        } else {
          state.refreshing = false;
        }
        state.error =
          action.payload || 'Failed to fetch user story attachments';
      })
      .addCase(uploadUserStoryAttachment.pending, state => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(
        uploadUserStoryAttachment.fulfilled,
        (state, action: PayloadAction<UploadUserStoryAttachmentResponse>) => {
          state.uploading = false;
          const uploaded = action.payload;
          if (uploaded?.id) {
            const attachment: Attachment = {
              id: uploaded.id,
              project_id: uploaded.project_id,
              user_story_id: uploaded.user_story_id,
              comment_id: uploaded.comment_id,
              original_filename: uploaded.original_filename,
              mime_type: uploaded.mime_type,
              file_size: uploaded.file_size,
              url: uploaded.url,
              uploaded_by: uploaded.uploaded_by,
              uploaded_by_name: uploaded.uploaded_by_name,
              uploaded_at: uploaded.uploaded_at,
              updated_at: uploaded.updated_at,
            };
            const existingIds = new Set(
              state.userStoryAttachments.map(a => a.id),
            );
            if (!existingIds.has(attachment.id)) {
              state.userStoryAttachments.push(attachment);
            }
          }
        },
      )
      .addCase(uploadUserStoryAttachment.rejected, (state, action) => {
        state.uploading = false;
        state.error =
          action.payload || 'Failed to upload user story attachment';
      })
      .addCase(deleteUserStoryAttachment.pending, state => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(
        deleteUserStoryAttachment.fulfilled,
        (state, action: PayloadAction<DeleteUserStoryAttachmentResponse>) => {
          state.deleting = false;
          const deletedId = action.payload?.attachmentId;
          if (deletedId) {
            state.userStoryAttachments = state.userStoryAttachments.filter(
              a => a.id !== deletedId,
            );
          }
        },
      )
      .addCase(deleteUserStoryAttachment.rejected, (state, action) => {
        state.deleting = false;
        state.error =
          action.payload || 'Failed to delete user story attachment';
      })
      .addCase(downloadUserStoryAttachment.pending, state => {
        state.downloading = true;
        state.error = null;
      })
      .addCase(downloadUserStoryAttachment.fulfilled, state => {
        state.downloading = false;
      })
      .addCase(downloadUserStoryAttachment.rejected, (state, action) => {
        state.downloading = false;
        state.error =
          action.payload || 'Failed to download user story attachment';
      })
      .addCase(fetchTaskAttachments.pending, (state, action) => {
        if (action.meta?.arg?.isInitial) {
          state.loading = true;
        } else {
          state.refreshing = true;
        }
        state.error = null;
      })
      .addCase(
        fetchTaskAttachments.fulfilled,
        (
          state,
          action: PayloadAction<
            GetTaskCommentAttachmentsResponse,
            string,
            { arg: GetTaskCommentAttachmentsParams }
          >,
        ) => {
          if (action.meta?.arg?.isInitial) {
            state.loading = false;
          } else {
            state.refreshing = false;
          }
          state.taskCommentAttachments = action.payload?.data || [];
        },
      )
      .addCase(fetchTaskAttachments.rejected, (state, action) => {
        if (action.meta?.arg?.isInitial) {
          state.loading = false;
        } else {
          state.refreshing = false;
        }
        state.error =
          action.payload || 'Failed to fetch task comment attachments';
      })
      .addCase(uploadTaskAttachment.pending, state => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(
        uploadTaskAttachment.fulfilled,
        (state, action: PayloadAction<UploadTaskCommentAttachmentResponse>) => {
          state.uploading = false;
          const uploaded = action.payload;
          if (uploaded?.id) {
            const attachment: Attachment = {
              id: uploaded.id,
              project_id: uploaded.project_id,
              task_id: uploaded.task_id,
              comment_id: uploaded.comment_id,
              original_filename: uploaded.original_filename,
              mime_type: uploaded.mime_type,
              file_size: uploaded.file_size,
              url: uploaded.url,
              uploaded_by: uploaded.uploaded_by,
              uploaded_by_name: uploaded.uploaded_by_name,
              uploaded_at: uploaded.uploaded_at,
              updated_at: uploaded.updated_at,
            };
            const existingIds = new Set(
              state.taskCommentAttachments.map(a => a.id),
            );
            if (!existingIds.has(attachment.id)) {
              state.taskCommentAttachments.push(attachment);
            }
          }
        },
      )
      .addCase(uploadTaskAttachment.rejected, (state, action) => {
        state.uploading = false;
        state.error =
          action.payload || 'Failed to upload task comment attachment';
      })
      .addCase(deleteTaskAttachment.pending, state => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(
        deleteTaskAttachment.fulfilled,
        (state, action: PayloadAction<DeleteTaskCommentAttachmentResponse>) => {
          state.deleting = false;
          const deletedId = action.payload?.attachmentId;
          if (deletedId) {
            state.taskCommentAttachments = state.taskCommentAttachments.filter(
              a => a.id !== deletedId,
            );
          }
        },
      )
      .addCase(deleteTaskAttachment.rejected, (state, action) => {
        state.deleting = false;
        state.error =
          action.payload || 'Failed to delete task comment attachment';
      })
      .addCase(downloadTaskAttachment.pending, state => {
        state.downloading = true;
        state.error = null;
      })
      .addCase(downloadTaskAttachment.fulfilled, state => {
        state.downloading = false;
      })
      .addCase(downloadTaskAttachment.rejected, (state, action) => {
        state.downloading = false;
        state.error =
          action.payload || 'Failed to download task comment attachment';
      });
  },
});

export const {
  clearAttachmentsState,
  clearUserStoryAttachments,
  clearTaskCommentAttachments,
  addLocalVideo,
  removeLocalVideo,
  clearLocalVideos,
} = attachmentSlice.actions;
export default attachmentSlice.reducer;
