import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ImagePicker from 'react-native-image-crop-picker';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import AppInput from '../components/common/Input/AppInput';
import PrimaryButton from '../components/common/Button/PrimaryButton';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { showErrorToast, showSuccessToast } from '../utils/utils';
import { useAppDispatch, useAppSelector } from '../store';
import CameraModal from '../components/cameraModal';
import { Radius } from '../constants/Radius';
import {
  getUserProfileInfo,
  updateUserProfileInfo,
} from '../store/auth_store/action/auth.thunks';
import { getRoleLabel } from '../constants/role';

const UpdateUserDetailsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { colors, strings } = useTheme();
  const { layout, moderateScale, isSmallHeight } = useAuthLayout();
  const [avatarUri, setAvatarUri] = useState<string | undefined>(
    user?.avatar_url,
  );
  const [name, setName] = useState<string>(user?.name ?? '');
  const [username, setUsername] = useState<string>(user?.username ?? '');
  const [email, setEmail] = useState<string>(user?.email ?? '');
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  };
  const handleChooseFromGallery = async () => {
    setPickerModalVisible(false);
    try {
      const image = await ImagePicker.openPicker({
        mediaType: 'photo',
        cropping: true,
        compressImageQuality: 0.8,
      });
      setAvatarUri(image.path);
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        showErrorToast('Failed to select image');
      }
    }
  };
  const handleTakePhoto = async () => {
    setPickerModalVisible(false);
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera access is required.');
      return;
    }

    try {
      const image = await ImagePicker.openCamera({
        mediaType: 'photo',
        cropping: true,
        freeStyleCropEnabled: true,
        compressImageQuality: 0.8,
      });
      setAvatarUri(image.path);
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        showErrorToast('Failed to capture photo');
      }
    }
  };

  const handleRemovePhoto = async () => {
    setPickerModalVisible(false);
  };

  const validate = () => {
    const newErrors = { name: '', username: '', email: '', password: '' };
    let isValid = true;
    if (!name.trim()) {
      newErrors.name =
        strings?.updateUser?.NameRequired || 'Full name is required';
      isValid = false;
    } else if (name.trim().length < 3) {
      newErrors.name =
        strings?.updateUser?.NameMinLength ||
        'Full name must be at least 3 characters';
      isValid = false;
    }
    if (!username.trim()) {
      newErrors.username =
        strings?.updateUser?.userNameRequired || 'Username is required';
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      newErrors.username =
        strings?.updateUser?.userNameInvalid ||
        '3-20 characters (letters, numbers, _)';
      isValid = false;
    }
    if (!email.trim()) {
      newErrors.email =
        strings?.updateUser?.emailRequired || 'Email address is required';
      isValid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email =
        strings?.updateUser?.emailInvalid || 'Enter a valid email address';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleUpdateDetails = () => {
    if (!validate()) return;
    setLoading(true);
    const formData = new FormData();
    if (name !== user?.name) {
      formData.append('full_name', name);
    }
    if (username !== user?.username) {
      formData.append('username', username);
    }
    if (avatarUri && avatarUri !== user?.avatar_url) {
      const fileName = avatarUri.split('/').pop() || 'avatar.jpg';
      const fileType = fileName.endsWith('.png')
        ? 'image/png'
        : fileName.endsWith('.webp')
          ? 'image/webp'
          : 'image/jpeg';
      formData.append('avatar', {
        uri: avatarUri,
        name: fileName,
        type: fileType,
      } as any);
    }
    if ((formData as FormData & { _parts: unknown[] })._parts.length === 0) {
      showErrorToast('No changes to update');
      setLoading(false);
      return;
    }
    dispatch(
      updateUserProfileInfo({
        formData,
        showSuccessToast,
        handleSuccess,
      }),
    );
  };

  const handleSuccess = () => {
    dispatch(getUserProfileInfo());
    navigation.goBack();
  };

  const isActiveUser = user?.is_active ?? true;

  return (
    <Screen scroll={true}>
      <View style={{ backgroundColor: colors.primary }}>
        <View
          style={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingTop: isSmallHeight ? moderateScale(12) : moderateScale(16),
            paddingBottom: isSmallHeight
              ? moderateScale(24)
              : moderateScale(32),
          }}
        >
          <View
            className='flex-row items-center'
            style={{ gap: layout.elementGap }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
              style={{ padding: moderateScale(4) }}
            >
              <Ionicons
                name='arrow-back'
                size={layout.iconSize * 1.1}
                color={colors.white}
              />
            </TouchableOpacity>
            <AppText
              variant='bodyLarge'
              className='font-bold'
              style={{
                fontSize: moderateScale(18),
                color: colors.white,
              }}
            >
              Profile
            </AppText>
          </View>
          <View className='items-center' style={{ gap: layout.elementGap }}>
            <TouchableOpacity
              className='relative'
              activeOpacity={0.8}
              onPress={() => setPickerModalVisible(true)}
            >
              <View
                className='items-center justify-center'
                style={{
                  width: isSmallHeight
                    ? moderateScale(100)
                    : moderateScale(116),
                  height: isSmallHeight
                    ? moderateScale(100)
                    : moderateScale(116),
                  marginRight: moderateScale(14),
                  borderRadius: Radius.circle,
                }}
              >
                {user?.avatar_url ? (
                  <Image
                    source={{ uri: user.avatar_url }}
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                    resizeMode='cover'
                  />
                ) : (
                  <View
                    className='items-center justify-center'
                    style={{
                      width: isSmallHeight
                        ? moderateScale(100)
                        : moderateScale(116),
                      height: isSmallHeight
                        ? moderateScale(100)
                        : moderateScale(116),
                      backgroundColor: colors.accentOrange,
                      borderRadius: Radius.circle,
                    }}
                  >
                    <AppText
                      style={{
                        fontSize: moderateScale(36),
                        fontWeight: 'bold',
                        color: colors.white,
                      }}
                    >
                      {user?.name
                        ?.split(' ')
                        .map(word => word[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase() || 'U'}
                    </AppText>
                  </View>
                )}
              </View>
              <View
                className='absolute bottom-0 right-0 items-center justify-center'
                style={{
                  width: isSmallHeight ? moderateScale(30) : moderateScale(34),
                  height: isSmallHeight ? moderateScale(30) : moderateScale(34),
                  borderRadius: Radius.circle,
                  backgroundColor: colors.primary,
                  borderWidth: 2,
                  borderColor: colors.white,
                }}
              >
                <Ionicons
                  name='camera'
                  size={
                    (isSmallHeight ? moderateScale(30) : moderateScale(34)) *
                    0.5
                  }
                  color={colors.white}
                />
              </View>
            </TouchableOpacity>
            <AppText
              variant='h2'
              className='text-center font-bold'
              style={{
                fontSize: isSmallHeight ? moderateScale(20) : moderateScale(22),
                color: colors.white,
              }}
            >
              {user?.name || strings?.updateUser?.headerTitle}
            </AppText>
            <AppText
              variant='body'
              className='text-center'
              style={{ color: colors.white }}
            >
              {getRoleLabel(user?.role)}
            </AppText>
            <View
              className='flex-row items-center justify-center'
              style={{
                backgroundColor: colors.card || colors.surface,
                paddingHorizontal: moderateScale(12),
                paddingVertical: moderateScale(3),
                borderRadius: Radius.circle,
                gap: moderateScale(6),
              }}
            >
              <View
                style={{
                  width: moderateScale(8),
                  height: moderateScale(8),
                  borderRadius: Radius.circle,
                  backgroundColor: isActiveUser ? colors.success : colors.error,
                }}
              />
              <AppText
                variant='caption'
                className='font-bold'
                style={{
                  color: colors.text,
                }}
              >
                {isActiveUser
                  ? strings?.updateUser?.statusActive || 'Active'
                  : strings?.updateUser?.statusInactive || 'Inactive'}
              </AppText>
            </View>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            borderTopLeftRadius: moderateScale(28),
            borderTopRightRadius: moderateScale(28),
            paddingHorizontal: layout.paddingHorizontal,
            paddingTop: isSmallHeight ? moderateScale(20) : moderateScale(28),
            paddingBottom: isSmallHeight
              ? moderateScale(20)
              : moderateScale(32),
            gap: layout.largeSectionGap,
          }}
        >
          <AppInput
            label={strings?.updateUser?.NameLabel || 'Name'}
            placeholder={
              strings?.updateUser?.NamePlaceholder || 'Enter full name'
            }
            leftIcon={
              <Ionicons
                name='person-outline'
                size={moderateScale(18)}
                color={colors.textSecondary}
              />
            }
            value={name}
            error={errors.name}
            onChangeText={text => {
              setName(text);
              setErrors(prev => ({ ...prev, name: '' }));
            }}
          />
          <AppInput
            label={strings?.updateUser?.userNameLabel || 'Username'}
            placeholder={
              strings?.updateUser?.userNamePlaceholder || 'Enter username'
            }
            leftIcon={
              <Ionicons
                name='at-outline'
                size={moderateScale(18)}
                color={colors.textSecondary}
              />
            }
            value={username}
            error={errors.username}
            onChangeText={text => {
              setUsername(text);
              setErrors(prev => ({ ...prev, username: '' }));
            }}
          />
          <AppInput
            label={strings?.updateUser?.emailLabel || 'Email Address'}
            placeholder={
              strings?.updateUser?.emailPlaceholder || 'Enter email address'
            }
            keyboardType='email-address'
            disabled
            autoCapitalize='none'
            leftIcon={
              <Ionicons
                name='mail-outline'
                size={moderateScale(18)}
                color={colors.textSecondary}
              />
            }
            value={email}
            error={errors.email}
            onChangeText={text => {
              setEmail(text);
              setErrors(prev => ({ ...prev, email: '' }));
            }}
          />
          <PrimaryButton
            title={strings?.updateUser?.submitButton || 'Save Changes'}
            style={{
              marginTop: isSmallHeight
                ? layout.largeSectionGap
                : layout.elementGap,
            }}
            loading={loading}
            onPress={handleUpdateDetails}
          />
        </View>
      </View>
      <CameraModal
        visible={pickerModalVisible}
        onClose={() => setPickerModalVisible(false)}
        onSelectCamera={handleTakePhoto}
        onSelectGallery={handleChooseFromGallery}
        onRemovePhoto={handleRemovePhoto}
        showRemoveOption={!!avatarUri}
      />
    </Screen>
  );
};

export default UpdateUserDetailsScreen;
