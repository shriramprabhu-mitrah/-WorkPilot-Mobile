import React from 'react';
import { CreateProjectModal } from './createProjectModel';
import { CameraPickerModal } from './cameraModal';
import { ProjectListModal } from './projectListModal';

export type ModalMode = 'camera' | 'createProject' | 'projectList';

interface PopupModelProps {
  visible: boolean;
  mode?: ModalMode;
  onClose: () => void;
  onSelectGallery?: () => void;
  onSelectCamera?: () => void;
  onSelectFile?: () => void;
  onRemovePhoto?: () => void;
  showRemoveOption?: boolean;
  title?: string;
  onSelectProject?: (projectId: string) => void;
}

const PopupModel: React.FC<PopupModelProps> = ({
  visible,
  mode = 'camera',
  onClose,
  onSelectGallery,
  onSelectCamera,
  onSelectFile,
  onRemovePhoto,
  showRemoveOption = false,
  title,
  onSelectProject,
}) => {
  if (mode === 'createProject') {
    return (
      <CreateProjectModal visible={visible} onClose={onClose} title={title} />
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
      onSelectFile={onSelectFile}
      onRemovePhoto={onRemovePhoto}
      showRemoveOption={showRemoveOption}
      title={title}
    />
  );
};

export default PopupModel;
export { CameraPickerModal, CreateProjectModal, ProjectListModal };
