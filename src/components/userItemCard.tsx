import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useTheme } from '../hooks/useTheme';
import { UserAssignedProject, Task } from '../types/project.type';
import {
  ProjectStatus,
  STATUS_LABELS,
  getValidStatus,
  getPriorityThemeColor,
} from '../utils/enum';

interface BaseProps {
  accentColor: string;
}
interface ProjectCardProps extends BaseProps {
  type: 'project';
  project: UserAssignedProject;
  onPress: (projectId: string, projectName?: string) => void;
}
interface TaskCardProps extends BaseProps {
  type: 'task';
  task: Task;
  onPress: (taskId: string, taskTitle?: string) => void;
}
type UserItemCardProps = ProjectCardProps | TaskCardProps;

const UserItemCard: React.FC<UserItemCardProps> = props => {
  const { colors } = useTheme();
  const { moderateScale } = useAuthLayout();
  const { accentColor, type } = props;

  const isProject = type === 'project';
  const project = isProject ? props.project : null;
  const task = !isProject ? props.task : null;

  // Status color
  let statusColor: string;
  if (isProject) {
    const status = getValidStatus(project!.status);
    statusColor =
      status === ProjectStatus.ACTIVE
        ? colors.primary
        : status === ProjectStatus.COMPLETED
          ? colors.success
          : status === ProjectStatus.PLANNING
            ? colors.info
            : status === ProjectStatus.ON_HOLD
              ? colors.warning
              : status === ProjectStatus.CANCELLED
                ? colors.error
                : colors.textSecondary;
  } else {
    const s = task!.status?.toLowerCase() ?? '';
    statusColor =
      s.includes('done') || s.includes('complete')
        ? colors.success
        : s.includes('progress') || s.includes('active')
          ? colors.primary
          : colors.textSecondary;
  }

  const priorityColor = !isProject
    ? getPriorityThemeColor(task!.priority, colors)
    : null;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={{
        padding: isProject ? moderateScale(18) : moderateScale(12),
        borderRadius: isProject ? moderateScale(16) : moderateScale(12),
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        gap: isProject ? moderateScale(12) : moderateScale(6),
      }}
      onPress={() =>
        isProject
          ? props.onPress(project!.project_id, project!.project_name)
          : props.onPress(task!.id, task!.title)
      }
    >
      {/* Accent rail */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: isProject ? 6 : 4,
          backgroundColor: accentColor,
          borderTopLeftRadius: isProject
            ? moderateScale(16)
            : moderateScale(12),
          borderBottomLeftRadius: isProject
            ? moderateScale(16)
            : moderateScale(12),
        }}
      />

      {/* Top row: key badge + status badge */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: moderateScale(8),
        }}
      >
        {isProject ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: moderateScale(8),
            }}
          >
            <View
              style={{
                width: moderateScale(32),
                height: moderateScale(32),
                borderRadius: moderateScale(16),
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: `${accentColor}18`,
              }}
            >
              <Ionicons
                name='business-outline'
                size={moderateScale(18)}
                color={accentColor}
              />
            </View>
            <View
              style={{
                paddingHorizontal: moderateScale(8),
                paddingVertical: moderateScale(4),
                borderRadius: moderateScale(6),
                backgroundColor: `${accentColor}18`,
              }}
            >
              <AppText
                variant='caption'
                style={{
                  color: accentColor,
                  fontWeight: '800',
                  letterSpacing: 0.4,
                }}
              >
                {project!.key || project!.project_key || 'PROJECT'}
              </AppText>
            </View>
          </View>
        ) : (
          <View
            style={{
              paddingHorizontal: moderateScale(8),
              paddingVertical: moderateScale(4),
              borderRadius: moderateScale(6),
              backgroundColor: `${accentColor}18`,
            }}
          >
            <AppText
              variant='caption'
              style={{
                color: accentColor,
                fontWeight: '800',
                letterSpacing: 0.4,
              }}
            >
              {task!.key || 'TASK'}
            </AppText>
          </View>
        )}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: moderateScale(5),
            paddingHorizontal: moderateScale(8),
            paddingVertical: moderateScale(4),
            borderRadius: isProject ? moderateScale(8) : moderateScale(20),
            backgroundColor: `${statusColor}18`,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: statusColor,
            }}
          />
          <AppText
            variant='caption'
            style={{ color: statusColor, fontWeight: '700' }}
          >
            {isProject
              ? STATUS_LABELS[getValidStatus(project!.status)] ||
                project!.status ||
                'Unknown'
              : task!.status || 'Todo'}
          </AppText>
        </View>
      </View>

      {/* Title */}
      <AppText
        variant={isProject ? 'bodyLarge' : 'body'}
        numberOfLines={2}
        style={{
          fontWeight: isProject ? 800 : 700,
        }}
      >
        {isProject ? project!.project_name : task!.title}
      </AppText>

      {/* Bottom row */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: moderateScale(8),
          paddingTop: isProject ? moderateScale(10) : moderateScale(6),
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
        }}
      >
        {isProject ? (
          <>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: moderateScale(5),
              }}
            >
              <Ionicons
                name='business-outline'
                size={moderateScale(15)}
                color={colors.textSecondary}
              />
              <AppText
                variant='caption'
                color={colors.textSecondary}
                numberOfLines={1}
                style={{ flexShrink: 1 }}
              >
                {project!.organization_name || 'Organization'}
              </AppText>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: moderateScale(4),
                maxWidth: '48%',
                paddingHorizontal: moderateScale(8),
                paddingVertical: moderateScale(4),
                borderRadius: moderateScale(7),
                backgroundColor: `${accentColor}10`,
                borderWidth: 1,
                borderColor: `${accentColor}28`,
              }}
            >
              <Ionicons
                name='person-circle-outline'
                size={moderateScale(15)}
                color={accentColor}
              />
              <AppText
                variant='caption'
                numberOfLines={1}
                style={{ color: accentColor, fontWeight: '600' }}
              >
                {project!.role || 'Member'}
              </AppText>
            </View>
          </>
        ) : (
          <>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                gap: moderateScale(5),
              }}
            >
              <Ionicons
                name='flag-outline'
                size={moderateScale(14)}
                color={priorityColor!}
              />
              <AppText
                variant='caption'
                numberOfLines={1}
                style={{ color: priorityColor!, fontWeight: '600' }}
              >
                {task!.priority || 'Low'}
              </AppText>
            </View>
            {task!.story_points !== undefined && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: moderateScale(4),
                  maxWidth: '48%',
                  paddingHorizontal: moderateScale(8),
                  paddingVertical: moderateScale(4),
                  borderRadius: moderateScale(14),
                  backgroundColor: `${accentColor}10`,
                  borderWidth: 1,
                  borderColor: `${accentColor}28`,
                }}
              >
                <Ionicons
                  name='speedometer-outline'
                  size={moderateScale(13)}
                  color={accentColor}
                />
                <AppText
                  variant='caption'
                  style={{ color: accentColor, fontWeight: '600' }}
                >
                  {task!.story_points} pts
                </AppText>
              </View>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(UserItemCard);
