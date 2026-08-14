import React from 'react';
import { CreateProjectModal } from './createProjectModel';
import { CameraPickerModal } from './cameraModal';

export type ModalMode = 'camera' | 'createProject';

interface PopupModelProps {
  visible: boolean;
  mode?: ModalMode;
  onClose: () => void;
  onSelectGallery?: () => void;
  onSelectCamera?: () => void;
  onRemovePhoto?: () => void;
  showRemoveOption?: boolean;
  title?: string;
}

const PopupModel: React.FC<PopupModelProps> = ({
  visible,
  mode = 'camera',
  onClose,
  onSelectGallery,
  onSelectCamera,
  onRemovePhoto,
  showRemoveOption = false,
  title,
}) => {
  if (mode === 'createProject') {
    return (
      <CreateProjectModal visible={visible} onClose={onClose} title={title} />
    );
  }

  return (
    <CameraPickerModal
      visible={visible}
      onClose={onClose}
      onSelectCamera={onSelectCamera}
      onSelectGallery={onSelectGallery}
      onRemovePhoto={onRemovePhoto}
      showRemoveOption={showRemoveOption}
      title={title}
    />
  );
};

export default PopupModel;
export { CameraPickerModal, CreateProjectModal };
