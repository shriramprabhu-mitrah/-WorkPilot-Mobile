import React from 'react';
import { View, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useTheme } from '../theme/ThemeProvider';
import AppText from './common/AppText';

interface OrganizationGuardModalProps {
  visible: boolean;
  onCreateOrganization: () => void;
  onLogout: () => void;
}

export const OrganizationGuardModal: React.FC<OrganizationGuardModalProps> = ({
  visible,
  onCreateOrganization,
  onLogout,
}) => {
  const { colors } = useTheme();
  const { moderateScale, layout } = useAuthLayout();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType='fade'
      // Empty no-op function disables hardware back button dismissal on Android
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          {/* Header Icon & Title */}
          <View className='mb-4 items-center'>
            <View
              className='mb-2 items-center justify-center rounded-full p-3'
              style={{ backgroundColor: colors.surface }}
            >
              <Ionicons
                name='business-outline'
                size={moderateScale(32)}
                color={colors.primary}
              />
            </View>
            <AppText
              variant='title'
              className='text-center font-bold'
              color={colors.text}
            >
              Organization Required
            </AppText>
          </View>

          {/* Body Message */}
          <AppText
            variant='body'
            className='mb-6 text-center'
            color={colors.textSecondary}
            style={{ lineHeight: moderateScale(22) }}
          >
            You don't have any organization, so first create it to access your
            app.
          </AppText>

          {/* Action Buttons */}
          <View style={{ gap: layout.elementGap }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onCreateOrganization}
              className='w-full items-center justify-center rounded-xl py-3.5'
              style={{ backgroundColor: colors.primary }}
            >
              <AppText
                variant='body'
                className='font-semibold'
                color={colors.white}
              >
                Create Organization
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onLogout}
              className='w-full items-center justify-center rounded-xl border py-3.5'
              style={{
                borderColor: colors.border,
                backgroundColor: colors.surface,
              }}
            >
              <AppText
                variant='body'
                className='font-semibold'
                color={colors.error || '#FF3B30'}
              >
                Log Out
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
