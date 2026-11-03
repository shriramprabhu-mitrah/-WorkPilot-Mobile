import React from 'react';
import {
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { AppText } from '../../../components';
import { useResponsive } from '../../../utils/responsive';
import { SprintActionMenuModalProps } from '../../../utils/sprintUtil';

const SprintActionMenuModal: React.FC<SprintActionMenuModalProps> = ({
  visible,
  onClose,
  canCreateUserStory,
  canCreateTask,
  canEditSprint,
  canDeleteSprint,
  permissionsReady,
  sprintAction,
  onCreateStory,
  onCreateStorylessTask,
  onSprintAction,
  onEditSprint,
  onDeleteSprint,
  colors,
}) => {
  const insets = useSafeAreaInsets();
  const { wp, moderateScale } = useResponsive();

  return (
    <Modal
      visible={visible}
      transparent
      animationType='fade'
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: moderateScale(24),
                borderTopRightRadius: moderateScale(24),
                paddingHorizontal: wp(5),
                paddingTop: moderateScale(16),
                paddingBottom:
                  insets.bottom > 0
                    ? insets.bottom + moderateScale(10)
                    : moderateScale(24),
                borderTopWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  width: moderateScale(36),
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.border,
                  alignSelf: 'center',
                  marginBottom: moderateScale(16),
                }}
              />
              <AppText
                variant='h3'
                style={{
                  fontSize: moderateScale(17),
                  fontWeight: '700',
                  color: colors.text,
                  marginBottom: moderateScale(14),
                }}
              >
                Sprint Actions
              </AppText>
              {permissionsReady && canCreateUserStory && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onCreateStory();
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: moderateScale(12),
                  }}
                >
                  <View
                    style={{
                      width: moderateScale(38),
                      height: moderateScale(38),
                      borderRadius: moderateScale(19),
                      backgroundColor: colors.card,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: moderateScale(12),
                    }}
                  >
                    <Ionicons
                      name='bookmark-outline'
                      size={moderateScale(19)}
                      color={colors.primary}
                    />
                  </View>
                  <AppText
                    variant='body'
                    style={{
                      fontSize: moderateScale(15),
                      fontWeight: '600',
                      color: colors.text,
                    }}
                  >
                    Create User Story
                  </AppText>
                </TouchableOpacity>
              )}
              {permissionsReady && canCreateTask && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onCreateStorylessTask();
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: moderateScale(12),
                  }}
                >
                  <View
                    style={{
                      width: moderateScale(38),
                      height: moderateScale(38),
                      borderRadius: moderateScale(19),
                      backgroundColor: colors.card,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: moderateScale(12),
                    }}
                  >
                    <Ionicons
                      name='checkbox-outline'
                      size={moderateScale(19)}
                      color={colors.success}
                    />
                  </View>
                  <AppText
                    variant='body'
                    style={{
                      fontSize: moderateScale(15),
                      fontWeight: '600',
                      color: colors.text,
                    }}
                  >
                    Create Storyless Task
                  </AppText>
                </TouchableOpacity>
              )}
              {permissionsReady &&
                canEditSprint &&
                sprintAction.action !== 'none' && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      onClose();
                      onSprintAction();
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: moderateScale(12),
                    }}
                  >
                    <View
                      style={{
                        width: moderateScale(38),
                        height: moderateScale(38),
                        borderRadius: moderateScale(19),
                        backgroundColor: colors.card,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: moderateScale(12),
                      }}
                    >
                      <Ionicons
                        name={sprintAction.icon}
                        size={moderateScale(20)}
                        color={colors.success}
                      />
                    </View>
                    <AppText
                      variant='body'
                      style={{
                        fontSize: moderateScale(15),
                        fontWeight: '600',
                        color: colors.text,
                      }}
                    >
                      {sprintAction.label}
                    </AppText>
                  </TouchableOpacity>
                )}
              {permissionsReady && canEditSprint && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onEditSprint();
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: moderateScale(12),
                  }}
                >
                  <View
                    style={{
                      width: moderateScale(38),
                      height: moderateScale(38),
                      borderRadius: moderateScale(19),
                      backgroundColor: colors.card,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: moderateScale(12),
                    }}
                  >
                    <Ionicons
                      name='pencil-outline'
                      size={moderateScale(19)}
                      color={colors.primary}
                    />
                  </View>
                  <AppText
                    variant='body'
                    style={{
                      fontSize: moderateScale(15),
                      fontWeight: '600',
                      color: colors.text,
                    }}
                  >
                    Edit Sprint Details
                  </AppText>
                </TouchableOpacity>
              )}
              {permissionsReady && canDeleteSprint && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onDeleteSprint();
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: moderateScale(12),
                  }}
                >
                  <View
                    style={{
                      width: moderateScale(38),
                      height: moderateScale(38),
                      borderRadius: moderateScale(19),
                      backgroundColor: colors.card,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: moderateScale(12),
                    }}
                  >
                    <Ionicons
                      name='trash-outline'
                      size={moderateScale(19)}
                      color={colors.error}
                    />
                  </View>
                  <AppText
                    variant='body'
                    style={{
                      fontSize: moderateScale(15),
                      fontWeight: '600',
                      color: colors.error,
                    }}
                  >
                    Delete Sprint
                  </AppText>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={onClose}
                style={{
                  marginTop: moderateScale(10),
                  backgroundColor: colors.card,
                  borderRadius: moderateScale(14),
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingVertical: moderateScale(12),
                  alignItems: 'center',
                }}
              >
                <AppText
                  variant='body'
                  style={{
                    fontSize: moderateScale(14),
                    fontWeight: '600',
                    color: colors.textSecondary,
                  }}
                >
                  Cancel
                </AppText>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default React.memo(SprintActionMenuModal);
