import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../../theme/ThemeProvider';
import { useAuthLayout } from '../../hooks/useAuthLayout';
import { WorkItemIcon } from '../../components/common/getWorkItemIcon';
import AppText from '../../components/common/AppText';
import { AppInput } from '../../components/common/Input';
import { PrimaryButton } from '../../components/common/Button';
import { RootState, useAppSelector, useAppDispatch } from '../../store';
import {
  updateProject,
  deleteProject,
  getAllProjectInfo,
} from '../../store/project_store/action/project_thunk';
import { useLazyGetProjectByIdQuery } from '../../store/api/projectApi';
import { showSuccessToast } from '../../utils/utils';
import { getValidStatus, ProjectStatus, STATUS_LABELS } from '../../utils/enum';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigationTypes';
import { Radius } from '../../constants/Radius';
import DeleteColumnModal from '../../components/DeleteColumnModal';

interface UpdateProjectDetailsProps {
  initialProjectName?: string;
}

const PAGE_SIZE = 10;

export const UpdateProjectDetails: React.FC<UpdateProjectDetailsProps> = ({
  initialProjectName = 'My Software Team',
}) => {
  const dispatch = useAppDispatch();
  const [getProjectByIdQuery] = useLazyGetProjectByIdQuery();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const {
    layout,
    isSmallHeight,
    isLargeHeight,
    hp,
    verticalScale,
    moderateScale,
  } = useAuthLayout();
  const { project } = useAppSelector((state: RootState) => state.projects);

  const [name, setName] = useState<string>(project?.name || initialProjectName);
  const [description, setDescription] = useState<string>(
    project?.description || '',
  );
  const [status, setStatus] = useState<ProjectStatus>(
    getValidStatus(project?.status),
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  useLayoutEffect(() => {
    dispatch(
      getAllProjectInfo({
        page: 1,
        page_size: PAGE_SIZE,
      }),
    );
  }, [dispatch]);

  useEffect(() => {
    if (project?.name) {
      setName(project.name);
    }
    if (project?.description) {
      setDescription(project.description);
    }
    if (project?.status) {
      setStatus(getValidStatus(project.status));
    }
  }, [project?.name, project?.description, project?.status]);

  const getProjectInitials = (projectName: string) => {
    if (!projectName || !projectName.trim()) {
      return 'PR';
    }
    const cleaned = projectName.trim();
    return cleaned.slice(0, 2).toUpperCase();
  };

  const projectInitials = getProjectInitials(name);

  const statusCategories = Object.values(ProjectStatus);

  const handleSuccess = () => {
    navigation.navigate('projectDetails');
  };

  const handleSave = () => {
    const projectId = project?.id;

    if (!name.trim()) {
      showSuccessToast?.('Project name is required', 'error');
      return;
    }

    if (!projectId) {
      showSuccessToast?.('Project ID not found', 'error');
      return;
    }

    setIsLoading(true);

    dispatch(
      updateProject({
        projectId,
        payload: {
          name: name.trim(),
          description: description.trim(),
          status,
        },
        onSuccess: message => {
          showSuccessToast(
            message || 'Project updated successfully',
            'success',
          );
          getProjectByIdQuery({ project_id: projectId }).then(() => {
            handleSuccess();
          });
        },
        onError: errorMessage => {
          showSuccessToast?.(
            errorMessage || 'Failed to update project',
            'error',
          );
        },
        onFinally: () => {
          setIsLoading(false);
        },
      }),
    );
  };

  const handleDeleteProject = () => {
    const projectId = project?.id;
    if (!projectId) {
      showSuccessToast?.('Project ID not found', 'error');
      return;
    }
    setIsDeleting(true);
    dispatch(
      deleteProject({
        projectId,
        onSuccess: message => {
          showSuccessToast?.(message || 'Project moved to trash', 'success');
          navigation.navigate('HomeTabs');
        },
        onError: errorMessage => {
          showSuccessToast?.(
            errorMessage || 'Failed to delete project',
            'error',
          );
        },
        onFinally: () => {
          setIsDeleting(false);
        },
      }),
    );
  };

  return (
    <ScrollView
      className='flex-1 px-6 py-4'
      style={{ backgroundColor: colors.surface }}
    >
      {/* Project Initials Avatar Section */}
      <View className='my-2 items-center justify-center'>
        <View
          className='mb-2 items-center justify-center rounded-2xl shadow-sm'
          style={{
            width: moderateScale(100),
            height: moderateScale(100),
            backgroundColor: colors.primary || '#FFC107',
          }}
        >
          <AppText
            className='font-bold'
            style={{
              fontSize: moderateScale(36),
              color: colors.white || '#FFFFFF',
            }}
          >
            {projectInitials}
          </AppText>
        </View>

        <TouchableOpacity activeOpacity={0.7} className='flex-row items-center'>
          <WorkItemIcon
            type='edit'
            size={moderateScale(14)}
            color={colors.textSecondary}
          />
          <AppText
            variant='caption'
            className='ml-1 font-medium'
            color={colors.textSecondary}
          >
            Change avatar
          </AppText>
        </TouchableOpacity>
      </View>

      <View style={{ gap: layout.elementGap }}>
        <AppInput
          label='Project Name'
          placeholder='Enter project name...'
          value={name}
          onChangeText={setName}
          leftIcon={
            <Ionicons
              name='folder-outline'
              size={20}
              color={colors.textSecondary}
            />
          }
        />
        <AppInput
          label='Description'
          placeholder='Enter project description...'
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          leftIcon={
            <Ionicons
              name='document-text-outline'
              size={20}
              color={colors.textSecondary}
            />
          }
        />
        <View>
          <AppText
            variant='body'
            style={{
              marginBottom: hp(0.8),
              fontSize: layout.bodyFontSize,
            }}
          >
            Status
          </AppText>
          <View
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: isDropdownOpen ? colors.primary : colors.border,
              borderRadius: Radius.md,
              paddingHorizontal: layout.paddingHorizontal / 1.5,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              className='flex-row items-center justify-between'
              style={{
                paddingVertical: isSmallHeight
                  ? verticalScale(10)
                  : isLargeHeight
                    ? verticalScale(16)
                    : verticalScale(12),
              }}
            >
              <AppText
                variant='body'
                style={{ fontSize: layout.bodyFontSize }}
                color={colors.text}
              >
                {STATUS_LABELS[status]}
              </AppText>
              <WorkItemIcon
                type={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={moderateScale(16)}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
            {isDropdownOpen && (
              <View
                className='border-t pb-1 pt-2'
                style={{ borderColor: colors.border }}
              >
                {statusCategories.map(item => (
                  <TouchableOpacity
                    key={item}
                    className='py-2'
                    onPress={() => {
                      setStatus(item);
                      setIsDropdownOpen(false);
                    }}
                  >
                    <AppText
                      variant='body'
                      color={status === item ? colors.primary : colors.text}
                      className={status === item ? 'font-bold' : 'font-normal'}
                    >
                      {STATUS_LABELS[item]}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      <View
        style={{ paddingBottom: moderateScale(100), gap: layout.elementGap }}
      >
        <View style={{ marginTop: moderateScale(10) }}>
          <PrimaryButton
            title='Save Changes'
            loading={isLoading}
            disabled={!name.trim() || isLoading || isDeleting}
            onPress={handleSave}
          />
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isDeleting || isLoading}
          onPress={() => setShowDeleteModal(true)}
          className='border'
          style={{
            borderColor: colors.border,
            backgroundColor: colors.background,
            paddingVertical: isSmallHeight
              ? verticalScale(10)
              : isLargeHeight
                ? verticalScale(16)
                : verticalScale(12),
            borderRadius: Radius.md,
            alignItems: 'center',
            opacity: isDeleting || isLoading ? 0.6 : 1,
          }}
        >
          {isDeleting ? (
            <ActivityIndicator size='small' color={colors.accentOrange} />
          ) : (
            <AppText
              variant='body'
              className='font-bold'
              color={colors.accentOrange}
            >
              Move to trash
            </AppText>
          )}
        </TouchableOpacity>
      </View>

      <DeleteColumnModal
        visible={showDeleteModal}
        columnTitle={name || 'project'}
        colors={colors}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteProject}
      />
    </ScrollView>
  );
};
