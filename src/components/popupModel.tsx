import React from 'react';
import { CreateProjectModal } from './createProjectModel';
import { CameraPickerModal } from './cameraModal';
import { ProjectListModal } from './projectListModal';

export type ModalMode =
  'camera' | 'createProject' | 'createRole' | 'projectList';

interface PopupModelProps {
  visible: boolean;
  mode?: ModalMode;
  onClose: () => void;
  onSelectGallery?: () => void;
  onSelectCamera?: () => void;
  onSelectRecordVideo?: () => void;
  onSelectFile?: () => void;
  onRemovePhoto?: () => void;
  showRemoveOption?: boolean;
  title?: string;
  onSelectProject?: (projectId: string) => void;
  onRoleCreate?: (name: string) => Promise<void> | void;
  validateRoleName?: (name: string) => string | undefined;
  isCreatingRole?: boolean;
}

const PopupModel: React.FC<PopupModelProps> = ({
  visible,
  mode = 'camera',
  onClose,
  onSelectGallery,
  onSelectCamera,
  onSelectRecordVideo,
  onSelectFile,
  onRemovePhoto,
  showRemoveOption = false,
  title,
  onSelectProject,
  onRoleCreate,
  validateRoleName,
  isCreatingRole,
}) => {
  if (mode === 'createProject') {
    return (
      <CreateProjectModal
        visible={visible}
        onClose={onClose}
        title={title}
        mode='project'
      />
    );
  }

  if (mode === 'createRole') {
    return (
      <CreateProjectModal
        visible={visible}
        onClose={onClose}
        title={title ?? 'Create Role'}
        mode='role'
        onCreateRole={onRoleCreate}
        validateRoleName={validateRoleName}
        isCreatingRole={isCreatingRole}
      />
    );
  }

  if (mode === 'projectList') {
    return (
      <ProjectListModal
        visible={visible}
        onClose={onClose}
        title={title}
        onSelectProject={onSelectProject}
      />
    );
  }

  return (
    <CameraPickerModal
      visible={visible}
      onClose={onClose}
      onSelectCamera={onSelectCamera}
      onSelectGallery={onSelectGallery}
      onSelectRecordVideo={onSelectRecordVideo}
      onSelectFile={onSelectFile}
      onRemovePhoto={onRemovePhoto}
      showRemoveOption={showRemoveOption}
      title={title}
    />
  );
};

export default PopupModel;
export { CameraPickerModal, CreateProjectModal, ProjectListModal };
