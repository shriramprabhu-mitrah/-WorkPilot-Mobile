import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  Alert,
  PermissionsAndroid,
  Platform,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ImagePicker from 'react-native-image-crop-picker';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import AppInput from '../components/common/Input/AppInput';
import PrimaryButton from '../components/common/Button/PrimaryButton';
import PopupModel from '../components/popupModel';
import { Radius } from '../constants/Radius';
import { showSnackbar } from '../components/common/Snackbar';
import {
  useGetCountriesQuery,
  useGetOrganizationDetailQuery,
  useUpdateOrganizationMutation,
} from '../store/api/homeApi';
import {
  Organization,
  UpdateOrganizationPayload,
  FormState,
  LogoState,
  UIState,
} from '../types/auth.type';

const formatDisplayLabel = (value: string) =>
  value ? value.replace(/_/g, ' ') : '';

const TEAM_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

const OrganizationDetailsScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const { layout, moderateScale, isSmallHeight } = useAuthLayout();

  const { data: orgResponse, refetch } = useGetOrganizationDetailQuery();
  const { data: countriesResponse } = useGetCountriesQuery();
  const [updateOrganization, { isLoading: updateLoading }] =
    useUpdateOrganizationMutation();

  const org: Organization | undefined = orgResponse?.data;
  const countries = useMemo(
    () => countriesResponse?.data ?? [],
    [countriesResponse],
  );

  const [formErrors, setFormErrors] = useState({ name: '' });

  const [formData, setFormData] = useState<FormState>({
    name: '',
    slug: '',
    domain: '',
    industry: 'Information Technology',
    teamSize: '11-50',
    selectedCountry: null,
  });

  const [logoData, setLogoData] = useState<LogoState>({
    uri: null,
    name: '',
    type: 'image/jpeg',
  });

  const [uiState, setUiState] = useState<UIState>({
    activeDropdown: null,
    isPickerModalOpen: false,
    countrySearchQuery: '',
  });

  const updateFormField = useCallback((key: keyof FormState, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateUI = useCallback((updates: Partial<UIState>) => {
    setUiState(prev => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    if (org) {
      setFormData({
        name: org.name || '',
        slug: org.slug || '',
        domain: org.domain || '',
        industry: formatDisplayLabel(org.industry || 'Information Technology'),
        teamSize: org.team_size || '11-50',
        selectedCountry: countries.find(c => c.name === org.country) ?? null,
      });

      if (org.logo_url) {
        setLogoData(prev => ({ ...prev, uri: org.logo_url ?? null }));
      }
    }
  }, [org, countries]);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch {
        return false;
      }
    }
    return true;
  };

  const handleChooseFromGallery = async () => {
    updateUI({ isPickerModalOpen: false });
    try {
      const image = await ImagePicker.openPicker({
        mediaType: 'photo',
        cropping: true,
        width: 600,
        height: 600,
        compressImageQuality: 0.8,
      });
      const fileName = image.path.split('/').pop() || 'logo.jpg';
      const fileType = fileName.endsWith('.png')
        ? 'image/png'
        : fileName.endsWith('.webp')
          ? 'image/webp'
          : 'image/jpeg';

      setLogoData({ uri: image.path, name: fileName, type: fileType });
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        showSnackbar({ message: 'Failed to select logo', type: 'error' });
      }
    }
  };

  const handleTakePhoto = async () => {
    updateUI({ isPickerModalOpen: false });
    if (!(await requestCameraPermission())) {
      Alert.alert('Permission Denied', 'Camera access is required.');
      return;
    }
    try {
      const image = await ImagePicker.openCamera({
        mediaType: 'photo',
        cropping: true,
        compressImageQuality: 0.8,
      });
      const fileName = image.path.split('/').pop() || 'logo.jpg';
      setLogoData({ uri: image.path, name: fileName, type: 'image/jpeg' });
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        showSnackbar({ message: 'Failed to capture photo', type: 'error' });
      }
    }
  };

  const handleRemovePhoto = () => {
    updateUI({ isPickerModalOpen: false });
    setLogoData({ uri: null, name: '', type: 'image/jpeg' });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setFormErrors({ name: 'Organization name is required' });
      return;
    }

    const payload: UpdateOrganizationPayload = {
      name: formData.name.trim(),
      domain: formData.domain.trim(),
      team_size: formData.teamSize,
      country_id: formData.selectedCountry?.id,
      logo: null,
    };

    if (logoData.uri && logoData.uri !== org?.logo_url) {
      const ext = logoData.name.split('.').pop() || 'jpg';
      payload.logo = {
        uri:
          Platform.OS === 'ios'
            ? logoData.uri.replace('file://', '')
            : logoData.uri,
        name: logoData.name || `logo.${ext}`,
        type: logoData.type,
      };
    }

    try {
      await updateOrganization(payload).unwrap();
      showSnackbar('Organization updated successfully');
      await refetch();
    } catch (error: any) {
      showSnackbar(
        error?.data?.message ||
          error?.message ||
          'Failed to update organization',
      );
    }
  };

  const filteredCountries = useMemo(() => {
    if (!uiState.countrySearchQuery) return countries;
    return countries.filter(c =>
      c.name.toLowerCase().includes(uiState.countrySearchQuery.toLowerCase()),
    );
  }, [countries, uiState.countrySearchQuery]);

  const dropdownConfig = useMemo(() => {
    switch (uiState.activeDropdown) {
      case 'teamSize':
        return {
          title: 'Select Team Size',
          options: TEAM_SIZES,
          selected: formData.teamSize,
        };
      case 'country':
        return {
          title: 'Select Country',
          options: filteredCountries.map(c => c.name),
          selected: formData.selectedCountry?.name || '',
        };
      default:
        return { title: '', options: [], selected: '' };
    }
  }, [uiState.activeDropdown, formData, filteredCountries]);

  const onDropdownSelect = (value: string) => {
    if (uiState.activeDropdown === 'teamSize')
      updateFormField('teamSize', value);
    if (uiState.activeDropdown === 'country') {
      const match = countries.find(c => c.name === value) ?? null;
      updateFormField('selectedCountry', match);
    }
    updateUI({ activeDropdown: null, countrySearchQuery: '' });
  };

  const DropdownTrigger = ({
    icon,
    label,
    placeholder,
    onPress,
    readOnly = false,
  }: {
    icon: any;
    label: string;
    placeholder: string;
    onPress?: () => void;
    readOnly?: boolean;
  }) => (
    <TouchableOpacity
      activeOpacity={readOnly ? 1 : 0.8}
      onPress={readOnly ? undefined : onPress}
      className='flex-1 flex-row items-center justify-between rounded-lg border bg-white px-[13px]'
      style={{
        height: moderateScale(48),
        borderColor: colors.border,
      }}
    >
      <View
        className='flex-1 flex-row items-center'
        style={{ gap: layout.elementGap }}
      >
        <Ionicons
          name={icon}
          size={moderateScale(18)}
          color={colors.textSecondary}
        />

        <AppText
          style={{
            flex: 1,
            fontSize: moderateScale(14),
            color: label ? colors.text : colors.placeholder,
          }}
          ellipsizeMode='tail'
          numberOfLines={1}
        >
          {label || placeholder}
        </AppText>
      </View>

      {!readOnly && (
        <Ionicons
          name='chevron-down'
          size={moderateScale(18)}
          color={colors.textSecondary}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <Screen scroll backgroundColor={colors.background}>
      {/* Header Banner */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingTop: moderateScale(16),
          paddingBottom: isSmallHeight ? moderateScale(20) : moderateScale(28),
          paddingHorizontal: layout.paddingHorizontal,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={{ padding: moderateScale(4), marginBottom: moderateScale(12) }}
        >
          <Ionicons
            name='arrow-back'
            size={moderateScale(24)}
            color={colors.white}
          />
        </TouchableOpacity>

        <View className='items-center' style={{ gap: layout.elementGap }}>
          <TouchableOpacity
            className='relative'
            activeOpacity={0.8}
            onPress={() => updateUI({ isPickerModalOpen: true })}
          >
            <View
              className='items-center justify-center overflow-hidden'
              style={{
                width: moderateScale(80),
                height: moderateScale(80),
                borderRadius: Radius.circle,
                borderWidth: 3,
                borderColor: colors.white,
              }}
            >
              {logoData.uri ? (
                <Image
                  source={{ uri: logoData.uri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode='cover'
                />
              ) : (
                <AppText
                  style={{
                    fontSize: moderateScale(28),
                    fontWeight: 'bold',
                    color: colors.white,
                  }}
                >
                  {formData.name
                    ?.split(' ')
                    .map(word => word[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase() || 'OR'}
                </AppText>
              )}
            </View>

            <View
              className='absolute bottom-0 right-0 items-center justify-center'
              style={{
                width: moderateScale(28),
                height: moderateScale(28),
                borderRadius: Radius.circle,
                backgroundColor: colors.primary,
                borderWidth: 2,
                borderColor: colors.white,
              }}
            >
              <Ionicons
                name='camera'
                size={moderateScale(14)}
                color={colors.white}
              />
            </View>
          </TouchableOpacity>

          <AppText
            variant='h2'
            className='text-center font-bold'
            style={{ fontSize: moderateScale(20), color: colors.white }}
          >
            {formData.name || 'Organization Name'}
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
                backgroundColor: org?.is_active ? colors.success : colors.error,
              }}
            />
            <AppText
              variant='caption'
              className='font-bold'
              style={{ color: colors.text }}
            >
              {org?.is_active
                ? strings?.updateUser?.statusActive || 'Active'
                : strings?.updateUser?.statusInactive || 'Inactive'}
            </AppText>
          </View>
        </View>
      </View>

      {/* Form Fields */}
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          borderTopLeftRadius: moderateScale(24),
          borderTopRightRadius: moderateScale(24),
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: moderateScale(24),
          paddingBottom: moderateScale(100),
          gap: layout.sectionGap,
        }}
      >
        <View>
          <View className='flex-row' style={{ marginBottom: layout.tightGap }}>
            <AppText variant='body' style={{ fontSize: layout.bodyFontSize }}>
              Organization Name
            </AppText>
            <AppText style={{ color: colors.error }}> *</AppText>
          </View>
          <AppInput
            placeholder='Enter organization name'
            leftIcon={
              <Ionicons
                name='business-outline'
                size={moderateScale(18)}
                color={colors.textSecondary}
              />
            }
            value={formData.name}
            error={formErrors.name}
            onChangeText={text => {
              updateFormField('name', text);
              setFormErrors({ name: '' });
            }}
          />
        </View>

        <AppInput
          label='Organization Slug'
          placeholder='Slug'
          value={`workPilot/${formData.slug}`}
          disabled
          helperText='Slug cannot be changed'
          leftIcon={
            <Ionicons
              name='link-outline'
              size={moderateScale(18)}
              color={colors.textSecondary}
            />
          }
        />

        <AppInput
          label='Domain'
          placeholder='e.g. company.com'
          autoCapitalize='none'
          keyboardType='url'
          leftIcon={
            <Ionicons
              name='globe-outline'
              size={moderateScale(18)}
              color={colors.textSecondary}
            />
          }
          value={formData.domain}
          onChangeText={text => updateFormField('domain', text)}
        />

        {/* Industry + Team Size Selectors */}
        <View className='flex-row gap-5'>
          <DropdownTrigger
            icon='briefcase-outline'
            label={formData.industry}
            placeholder='Select Industry'
            readOnly
          />
          <DropdownTrigger
            icon='people-outline'
            label={formData.teamSize}
            placeholder='Select Team Size'
            onPress={() => updateUI({ activeDropdown: 'teamSize' })}
          />
        </View>

        {/* Country Selector */}
        <View className='mb-5'>
          <View className='flex-row' style={{ marginBottom: layout.tightGap }}>
            <AppText variant='body' style={{ fontSize: layout.bodyFontSize }}>
              Country
            </AppText>
            <AppText style={{ color: colors.error }}> *</AppText>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => updateUI({ activeDropdown: 'country' })}
            className='flex-row items-center justify-between rounded-lg border bg-white px-[14px]'
            style={{ height: moderateScale(48), borderColor: colors.border }}
          >
            <AppText
              style={{
                fontSize: moderateScale(14),
                color: formData.selectedCountry
                  ? colors.text
                  : colors.placeholder,
              }}
            >
              {formData.selectedCountry
                ? `${formData.selectedCountry.flag_emoji || ''} ${formData.selectedCountry.name}`.trim()
                : 'Select country'}
            </AppText>
            <Ionicons
              name='chevron-down'
              size={moderateScale(18)}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <PrimaryButton
          title={strings?.common?.saveChanges || 'Save Changes'}
          loading={updateLoading}
          onPress={handleSave}
        />
      </View>

      {/* Shared Bottom Sheet Dropdown Modal */}
      <Modal
        visible={uiState.activeDropdown !== null}
        transparent
        animationType='fade'
        onRequestClose={() =>
          updateUI({ activeDropdown: null, countrySearchQuery: '' })
        }
      >
        <TouchableOpacity
          className='flex-1 justify-end bg-black/35'
          activeOpacity={1}
          onPress={() =>
            updateUI({ activeDropdown: null, countrySearchQuery: '' })
          }
        >
          <TouchableOpacity
            className='max-h-[70%] rounded-t-[20px] bg-white px-5 pb-[30px] pt-[18px]'
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
          >
            <View className='mb-[5px] flex-row items-center justify-between border-b border-slate-200 pb-[15px]'>
              <AppText
                variant='body'
                style={{ fontWeight: '700', color: colors.text }}
              >
                {dropdownConfig.title}
              </AppText>
              <TouchableOpacity
                onPress={() =>
                  updateUI({ activeDropdown: null, countrySearchQuery: '' })
                }
              >
                <Ionicons name='close' size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {uiState.activeDropdown === 'country' && (
              <TextInput
                value={uiState.countrySearchQuery}
                onChangeText={query => updateUI({ countrySearchQuery: query })}
                placeholder='Search country...'
                placeholderTextColor={colors.placeholder}
                className='my-2 rounded-lg border px-3 py-2 text-sm'
                style={{ borderColor: colors.border, color: colors.text }}
              />
            )}

            <ScrollView
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              keyboardShouldPersistTaps='handled'
              style={{ paddingBottom: moderateScale(25) }}
            >
              {dropdownConfig.options.map(option => {
                const isSelected = dropdownConfig.selected === option;
                return (
                  <TouchableOpacity
                    key={option}
                    className='min-h-12 flex-row items-center justify-between border-b border-slate-100 px-2'
                    style={{
                      backgroundColor: isSelected
                        ? `${colors.primary}10`
                        : 'transparent',
                    }}
                    onPress={() => onDropdownSelect(option)}
                  >
                    <AppText
                      style={{
                        fontSize: moderateScale(14),
                        color: isSelected ? colors.primary : colors.text,
                        fontWeight: isSelected ? '700' : '400',
                      }}
                    >
                      {option}
                    </AppText>
                    {isSelected && (
                      <Ionicons
                        name='checkmark'
                        size={moderateScale(20)}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Image Picker Action Sheet */}
      <PopupModel
        visible={uiState.isPickerModalOpen}
        onClose={() => updateUI({ isPickerModalOpen: false })}
        onSelectCamera={handleTakePhoto}
        onSelectGallery={handleChooseFromGallery}
        onRemovePhoto={handleRemovePhoto}
        showRemoveOption={Boolean(logoData.uri)}
      />
    </Screen>
  );
};

export default OrganizationDetailsScreen;
