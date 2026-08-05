import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Modal,
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
// import PasswordRules from '../components/passwordRules';
// import { PasswordInput } from '../components';
import {
  getUserProfileInfo,
  updateUserProfileInfo,
  UpdateUserProfilePayload,
} from '../store/user_store/action/user.thunks';
import CameraModal from '../components/cameraModal';
import { Radius } from '../constants/Radius';

const UpdateUserDetailsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.user);
  const { colors, strings } = useTheme();
  const { layout, moderateScale, isSmallHeight } = useAuthLayout();
  const [avatarUri, setAvatarUri] = useState<string | undefined>(
    user?.avatar_url,
  );
  const [name, setName] = useState<string>(user?.name ?? '');
  const [username, setUsername] = useState<string>(user?.username ?? '');
  const [email, setEmail] = useState<string>(user?.email ?? '');
  const [password, setPassword] = useState<string>('');
  const [pickerModalVisible, setPickerModalVisible] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const avatarSize = isSmallHeight ? moderateScale(80) : moderateScale(96);
  const badgeSize = isSmallHeight ? moderateScale(26) : moderateScale(30);
  const cardBorderRadius = moderateScale(20);

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
    if (password.length > 0 && password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleUpdateDetails = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: UpdateUserProfilePayload = {};
      if (name !== user?.name) {
        payload.full_name = name;
      }
      if (username !== user?.username) {
        payload.username = username;
      }
      if (avatarUri && avatarUri !== user?.avatar_url) {
        payload.avatar = avatarUri;
      }
      if (Object.keys(payload).length === 0) {
        showErrorToast('No changes to update');
        return;
      }
      console.log('payload', payload);
      const result = await dispatch(updateUserProfileInfo(payload)).unwrap();
      showSuccessToast(result.message, 'success');
      await dispatch(getUserProfileInfo());
      navigation.goBack();
    } catch (error: any) {
      showErrorToast(
        error ||
          strings?.updateUser?.defaultErrorMessage ||
          'Failed to update user profile',
      );
    } finally {
      setLoading(false);
    }
  };

  const isActiveUser = user?.is_active ?? true;

  return (
    <Screen scroll={true}>
      <View
        className='flex-1'
        style={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: isSmallHeight ? moderateScale(12) : moderateScale(16),
          paddingBottom: isSmallHeight ? moderateScale(16) : moderateScale(24),
        }}
      >
        <TouchableOpacity
          className='self-start'
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name='arrow-back'
            size={layout.iconSize * 1.1}
            color={colors.text}
          />
        </TouchableOpacity>
        <View
          className='items-center'
          style={{
            marginBottom: isSmallHeight ? moderateScale(14) : moderateScale(20),
            gap: layout.elementGap,
          }}
        >
          <TouchableOpacity
            className='relative'
            activeOpacity={0.8}
            onPress={() => setPickerModalVisible(true)}
          >
            <View
              className='items-center justify-center shadow'
              style={{
                width: avatarSize,
                height: avatarSize,
                borderRadius: Radius.circle,
                backgroundColor: colors.card || colors.surface,
                borderWidth: 3,
                borderColor: colors.primary,
              }}
            >
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  className='h-full w-full'
                  resizeMode='cover'
                  style={{ borderRadius: Radius.circle }}
                />
              ) : (
                <Ionicons
                  name='person'
                  size={avatarSize * 0.5}
                  color={colors.textSecondary}
                />
              )}
            </View>
            <View
              className='absolute bottom-0 right-0 items-center justify-center border-2 shadow'
              style={{
                width: badgeSize,
                height: badgeSize,
                borderRadius: Radius.circle,
                backgroundColor: colors.primary,
                borderColor: colors.background,
              }}
            >
              <Ionicons
                name='camera'
                size={badgeSize * 0.5}
                color={colors.white}
              />
            </View>
          </TouchableOpacity>
          <AppText
            variant='h2'
            className='text-center font-bold'
            style={{
              fontSize: isSmallHeight ? moderateScale(18) : moderateScale(20),
            }}
          >
            {user?.name || strings?.updateUser?.headerTitle}
          </AppText>

          <View
            className='flex-row items-center justify-center'
            style={{ gap: moderateScale(10) }}
          >
            <View
              className='border px-2.5 py-1'
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
                borderRadius: Radius.lg,
              }}
            >
              <AppText
                variant='caption'
                color={colors.textSecondary}
                className='font-semibold uppercase tracking-wider'
                style={{ fontSize: moderateScale(10) }}
              >
                {user?.role || 'User'}
              </AppText>
            </View>

            <View
              className={`flex-row items-center px-2.5 py-1 ${
                isActiveUser ? 'bg-emerald-500/10' : 'bg-red-500/10'
              }`}
              style={{ gap: moderateScale(4), borderRadius: Radius.lg }}
            >
              <View
                className={`h-1.5 w-1.5 rounded-full ${
                  isActiveUser ? 'bg-emerald-500' : 'bg-red-500'
                }`}
              />
              <AppText
                variant='caption'
                className={`font-bold ${
                  isActiveUser ? 'text-emerald-500' : 'text-red-500'
                }`}
                style={{ fontSize: moderateScale(10) }}
              >
                {isActiveUser
                  ? strings?.updateUser?.statusActive || 'Active'
                  : strings?.updateUser?.statusInactive || 'Inactive'}
              </AppText>
            </View>
          </View>
        </View>
        <View
          className='shadow'
          style={{
            backgroundColor: colors.card || colors.surface,
            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: isSmallHeight
              ? moderateScale(14)
              : moderateScale(18),
            borderRadius: cardBorderRadius,
            gap: isSmallHeight ? moderateScale(10) : layout.elementGap,
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
            aria-disabled
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
          {/* <View className='relative z-20'>
            <PasswordRules password={password} />
            <PasswordInput
              label={strings?.signUp?.passwordLabel || 'New Password'}
              placeholder={
                strings?.signUp?.passwordPlaceholder || 'Enter new password'
              }
              leftIcon={
                <Ionicons
                  name='lock-closed-outline'
                  size={moderateScale(18)}
                  color={colors.textSecondary}
                />
              }
              value={password}
              error={errors.password}
              onChangeText={text => {
                setPassword(text);
                setErrors(prev => ({ ...prev, password: '' }));
              }}
            />
          </View> */}
          <View style={{ marginTop: moderateScale(6) }}>
            <PrimaryButton
              title={strings?.updateUser?.submitButton || 'Save Changes'}
              loading={loading}
              onPress={handleUpdateDetails}
              style={{
                paddingVertical: isSmallHeight
                  ? moderateScale(12)
                  : moderateScale(14),
              }}
            />
          </View>
        </View>
      </View>
      <CameraModal
        visible={pickerModalVisible}
        onClose={() => setPickerModalVisible(false)}
        onSelectGallery={handleChooseFromGallery}
        onSelectCamera={handleTakePhoto}
      />
    </Screen>
  );
};

export default UpdateUserDetailsScreen;
