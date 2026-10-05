import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Path } from 'react-native-svg';
import {
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';

import { RootStackParamList } from '../../types/navigationTypes';
import { useTheme } from '../../theme/ThemeProvider';
import { getCountryService } from '../../services/public.service';
import {
  createOrganizationService,
  inviteOrganizationService,
} from '../../services/organization.service'; // Adjust path as needed
import { Country } from '../../types/auth.type';
import LinearGradient from 'react-native-linear-gradient';
import { createOrganization } from '../../store/auth_store/action/auth.thunks';
import { useAppDispatch } from '../../store';
import { useResponsive } from '../../utils/responsive';

type DropdownType = 'industry' | 'size' | null;

interface TeamMember {
  id: string;
  email: string;
  role: string;
}

const INDUSTRIES = [
  'Information_Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail',
  'Real Estate',
  'Logistics',
  'Hospitality',
  'Other',
];

const ORGANIZATION_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
];

const ROLES = ['Admin', 'Developer', 'Designer', 'Manager', 'Member'];

const PRESET_COLORS = [
  '#2563EB',
  '#7C3AED',
  '#DB2777',
  '#EA580C',
  '#16A34A',
  '#0891B2',
  '#1E293B',
];

const HeaderIcon = () => (
  <View className='mb-3 h-[54px] w-[54px] items-center justify-center rounded-2xl bg-blue-600'>
    <Svg width='38' height='38' viewBox='0 0 24 24' fill='none'>
      <Path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M2.5 11C2.5 6 7 2.5 12 2.5C17 2.5 21.5 6 21.5 11H2.5ZM12 9C11.1716 9 10.5 8.32843 10.5 7.5C10.5 6.67157 11.1716 6 12 6C12.8284 6 13.5 6.67157 13.5 7.5C13.5 8.32843 12.8284 9 12 9Z'
        fill='white'
      />
      <Path
        d='M1.5 14C1.5 14 6 19.5 12 19.5C18 19.5 22.5 14 22.5 14'
        stroke='white'
        strokeWidth='2.5'
        strokeLinecap='round'
      />
    </Svg>
  </View>
);

const Organization = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const dispatch = useAppDispatch();

  const { scale, verticalScale, moderateScale } = useResponsive();
  // Multi-step state: 1 = Organization, 2 = Team Setup, 3 = Branding
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1 States
  const [organizationName, setOrganizationName] = useState('');
  const [organizationSlug, setOrganizationSlug] = useState('');
  const [industry, setIndustry] = useState('Information Technology');
  const [organizationSize, setOrganizationSize] = useState('11-50');
  const [dropdown, setDropdown] = useState<DropdownType>(null);
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [countryDropdown, setCountryDropdown] = useState(false);
  const [errors, setErrors] = useState({
    organizationName: '',
    organizationSlug: '',
    country: '',
  });

  // Step 2 States
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', email: '', role: 'Developer' },
  ]);
  const [activeRoleModalIndex, setActiveRoleModalIndex] = useState<
    number | null
  >(null);

  // Step 3 States
  const [selectedColor, setSelectedColor] = useState('#2563EB');
  const [companyLogo, setCompanyLogo] = useState<any>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await getCountryService();
        setCountries(response.data ?? []);
      } catch (error) {
        console.error('Failed to fetch countries:', error);
      }
    };
    fetchCountries();
  }, []);

  // Step 1 Handlers
  const handleOrganizationNameChange = (text: string) => {
    setOrganizationName(text);

    setErrors(prev => ({
      ...prev,
      organizationName: '',
      organizationSlug: '',
    }));
  };

  const handleSlugChange = (text: string) => {
    const slug = text
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-');

    setOrganizationSlug(slug);
    setErrors(prev => ({ ...prev, organizationSlug: '' }));
  };

  const validateStepOne = () => {
    const newErrors = {
      organizationName: '',
      organizationSlug: '',
      country: '',
    };

    if (!organizationName.trim()) {
      newErrors.organizationName = 'Organization name is required';
    }

    if (!organizationSlug.trim()) {
      newErrors.organizationSlug = 'Organization domain is required';
    }

    if (!selectedCountry) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleNextStepOne = () => {
    if (!validateStepOne()) return;
    setCurrentStep(2);
  };

  // Step 2 Handlers
  const handleAddMember = () => {
    setTeamMembers(prev => [
      ...prev,
      { id: Date.now().toString(), email: '', role: 'Developer' },
    ]);
  };

  const handleRemoveMember = (index: number) => {
    if (teamMembers.length <= 1) return;
    setTeamMembers(prev => prev.filter((_, i) => i !== index));
  };

  const handleMemberEmailChange = (text: string, index: number) => {
    setTeamMembers(prev => {
      const updated = [...prev];
      updated[index].email = text;
      return updated;
    });
  };

  const handleRoleSelect = (role: string, index: number) => {
    setTeamMembers(prev => {
      const updated = [...prev];
      updated[index].role = role;
      return updated;
    });
    setActiveRoleModalIndex(null);
  };

  // Step 3 Image Picker Handler
  const handleUploadLogo = async () => {
    const result: ImagePickerResponse = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setCompanyLogo({
        uri: asset.uri,
        name: asset.fileName || 'logo.jpg',
        type: asset.type || 'image/jpeg',
      });
    }
  };

  // API Submission using FormData
  const handleFinalSubmit = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const formData = new FormData();

      // 1. Prepare Organization FormData
      formData.append('name', organizationName.trim());
      formData.append('domain', organizationSlug.trim());
      formData.append('industry', industry);
      formData.append('team_size', organizationSize);
      formData.append('country_id', selectedCountry?.id ?? '');
      formData.append('brand_color', selectedColor);

      if (companyLogo) {
        formData.append('logo', companyLogo as any);
      }

      // 2. Create the Organization
      await dispatch(
        createOrganization({
          payload: formData,
        }),
      );
      // 3. Filter & Invite Team Members (Runs only after org creation succeeds)
      const validMembers = teamMembers
        .filter(m => m.email.trim().length > 0)
        .map(m => ({ email: m.email.trim() }));

      if (validMembers.length > 0) {
        await inviteOrganizationService({
          members: validMembers,
        });
      }

      navigation.replace('HomeTabs');
    } catch (error: any) {
      Alert.alert(
        'Submission Failed',
        error?.response?.data?.message ||
          'Something went wrong while processing your request.',
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = countries.filter(item =>
    item.name.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  const dropdownOptions =
    dropdown === 'industry' ? INDUSTRIES : ORGANIZATION_SIZES;
  const dropdownTitle =
    dropdown === 'industry' ? 'Select Industry' : 'Organization Size';

  const previewInitial = organizationName.trim()
    ? organizationName.trim().charAt(0).toUpperCase()
    : 'W';

  return (
    <SafeAreaView
      className='flex-1'
      style={{ backgroundColor: colors.background || '#FFFFFF' }}
    >
      <StatusBar
        backgroundColor={colors.background || '#FFFFFF'}
        barStyle='dark-content'
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: verticalScale(40) }}
        className='px-6'
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          className='items-center'
          style={{ paddingTop: verticalScale(50) }}
        >
          <HeaderIcon />
          <Text
            className='text-center font-bold'
            style={{
              color: colors.text || '#111827',
              fontSize: moderateScale(26),
              lineHeight: moderateScale(32),
            }}
          >
            Welcome to WorkPilot
          </Text>
          <Text
            className='text-center'
            style={{
              color: colors.textSecondary || '#6B7280',
              fontSize: moderateScale(14),
              lineHeight: moderateScale(21),
              marginTop: verticalScale(8),
            }}
          >
            You are just a few steps away from creating your team's workspace.
          </Text>
        </View>

        {/* Dynamic Progress Bar */}
        <View style={{ marginTop: verticalScale(24) }}>
          <View
            className='overflow-hidden rounded-full bg-gray-200'
            style={{ height: verticalScale(7) }}
          >
            <LinearGradient
              colors={['#2563EB', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                height: '100%',
                borderRadius: 9999,
                width:
                  currentStep === 1
                    ? '33.33%'
                    : currentStep === 2
                      ? '66.66%'
                      : '100%',
              }}
            />
          </View>

          <View
            className='flex-row items-start justify-between'
            style={{ marginTop: verticalScale(12) }}
          >
            {/* Step 1 Indicator */}
            <View className='items-center' style={{ width: scale(80) }}>
              <View
                className='items-center justify-center rounded-full bg-blue-600'
                style={{ width: scale(32), height: scale(32) }}
              >
                <Text
                  className='font-bold text-white'
                  style={{ fontSize: moderateScale(13) }}
                >
                  1
                </Text>
              </View>
              <Text
                className='text-center font-semibold text-blue-600'
                style={{
                  fontSize: moderateScale(11),
                  marginTop: verticalScale(6),
                }}
              >
                Organization
              </Text>
            </View>

            <View
              className={`h-px flex-1 ${
                currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              style={{ marginTop: verticalScale(16) }}
            />

            {/* Step 2 Indicator */}
            <View className='items-center' style={{ width: scale(80) }}>
              <View
                className={`items-center justify-center rounded-full ${
                  currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-100'
                }`}
                style={{ width: scale(32), height: scale(32) }}
              >
                <Text
                  style={{ fontSize: moderateScale(13) }}
                  className={
                    currentStep >= 2
                      ? 'font-bold text-white'
                      : 'font-semibold text-gray-400'
                  }
                >
                  2
                </Text>
              </View>
              <Text
                style={{
                  fontSize: moderateScale(11),
                  marginTop: verticalScale(6),
                }}
                className={`text-center ${
                  currentStep >= 2
                    ? 'font-semibold text-blue-600'
                    : 'text-slate-400'
                }`}
              >
                Team Setup (opt)
              </Text>
            </View>

            <View
              className={`h-px flex-1 ${
                currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              style={{ marginTop: verticalScale(16) }}
            />

            {/* Step 3 Indicator */}
            <View className='items-center' style={{ width: scale(80) }}>
              <View
                className={`items-center justify-center rounded-full ${
                  currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-100'
                }`}
                style={{ width: scale(32), height: scale(32) }}
              >
                <Text
                  style={{ fontSize: moderateScale(13) }}
                  className={
                    currentStep >= 3
                      ? 'font-bold text-white'
                      : 'font-semibold text-gray-400'
                  }
                >
                  3
                </Text>
              </View>
              <Text
                style={{
                  fontSize: moderateScale(11),
                  marginTop: verticalScale(6),
                }}
                className={`text-center ${
                  currentStep >= 3
                    ? 'font-semibold text-blue-600'
                    : 'text-slate-400'
                }`}
              >
                Branding (opt)
              </Text>
            </View>
          </View>
        </View>

        {/* STEP 1: ORGANIZATION SETUP */}
        {currentStep === 1 && (
          <View style={{ marginTop: verticalScale(32) }}>
            <Text
              className='font-bold'
              style={{
                color: colors.text || '#111827',
                fontSize: moderateScale(20),
              }}
            >
              Set up your organization
            </Text>
            <Text
              style={{
                color: colors.textSecondary || '#6B7280',
                fontSize: moderateScale(14),
                marginTop: verticalScale(6),
                marginBottom: verticalScale(24),
              }}
            >
              This step is required to access your workspace.
            </Text>

            {/* Organization Name */}
            <View style={{ marginBottom: verticalScale(20) }}>
              <Text
                className='font-medium text-gray-800'
                style={{
                  fontSize: moderateScale(14),
                  marginBottom: verticalScale(8),
                }}
              >
                Organization name <Text className='text-red-500'>*</Text>
              </Text>
              <TextInput
                value={organizationName}
                onChangeText={handleOrganizationNameChange}
                placeholder='e.g. Acme Corp'
                placeholderTextColor='#9CA3AF'
                style={{
                  height: verticalScale(46),
                  fontSize: moderateScale(14),
                  paddingHorizontal: scale(14),
                }}
                className={`rounded-lg border bg-white text-slate-800 ${
                  errors.organizationName
                    ? 'border-red-500'
                    : 'border-slate-300'
                }`}
              />
              {!!errors.organizationName && (
                <Text
                  className='text-red-500'
                  style={{
                    fontSize: moderateScale(11),
                    marginTop: verticalScale(4),
                  }}
                >
                  {errors.organizationName}
                </Text>
              )}
            </View>

            {/* Domain Field */}
            <View style={{ marginBottom: verticalScale(20) }}>
              <Text
                className='font-medium text-gray-800'
                style={{
                  fontSize: moderateScale(14),
                  marginBottom: verticalScale(8),
                }}
              >
                Organization URL <Text className='text-red-500'>*</Text>
              </Text>
              <View
                className={`flex-row overflow-hidden rounded-lg border bg-white ${
                  errors.organizationSlug
                    ? 'border-red-500'
                    : 'border-slate-300'
                }`}
                style={{ height: verticalScale(46) }}
              >
                <View
                  className='justify-center border-r border-slate-300 bg-slate-50'
                  style={{ paddingHorizontal: scale(12) }}
                >
                  <Text
                    className='text-slate-500'
                    style={{ fontSize: moderateScale(13) }}
                  >
                    workpilot.app/
                  </Text>
                </View>
                <TextInput
                  value={organizationSlug}
                  onChangeText={handleSlugChange}
                  placeholder='acme-corp'
                  placeholderTextColor='#9CA3AF'
                  autoCapitalize='none'
                  style={{
                    fontSize: moderateScale(14),
                    paddingHorizontal: scale(12),
                  }}
                  className='flex-1 text-slate-800'
                />
              </View>
              {!!errors.organizationSlug && (
                <Text
                  className='text-red-500'
                  style={{
                    fontSize: moderateScale(11),
                    marginTop: verticalScale(4),
                  }}
                >
                  {errors.organizationSlug}
                </Text>
              )}
            </View>

            {/* Industry + Team Size */}
            <View
              className='flex-row gap-4'
              style={{ marginBottom: verticalScale(20) }}
            >
              <View className='flex-1'>
                <Text
                  className='font-medium text-gray-800'
                  style={{
                    fontSize: moderateScale(14),
                    marginBottom: verticalScale(8),
                  }}
                >
                  Industry <Text className='text-red-500'>*</Text>
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  className='flex-row items-center justify-between rounded-lg border border-slate-300 bg-white'
                  style={{
                    height: verticalScale(46),
                    paddingHorizontal: scale(12),
                  }}
                  onPress={() => setDropdown('industry')}
                >
                  <Text
                    className='text-slate-800'
                    numberOfLines={1}
                    style={{ fontSize: moderateScale(10) }}
                  >
                    {industry}
                  </Text>
                  <Ionicons
                    name='chevron-down'
                    size={scale(18)}
                    color='#374151'
                  />
                </TouchableOpacity>
              </View>

              <View className='flex-1'>
                <Text
                  className='font-medium text-gray-800'
                  style={{
                    fontSize: moderateScale(14),
                    marginBottom: verticalScale(8),
                  }}
                >
                  Team size <Text className='text-red-500'>*</Text>
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  className='flex-row items-center justify-between rounded-lg border border-slate-300 bg-white'
                  style={{
                    height: verticalScale(46),
                    paddingHorizontal: scale(12),
                  }}
                  onPress={() => setDropdown('size')}
                >
                  <Text
                    className='text-slate-800'
                    style={{ fontSize: moderateScale(14) }}
                  >
                    {organizationSize}
                  </Text>
                  <Ionicons
                    name='chevron-down'
                    size={scale(18)}
                    color='#374151'
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Country Dropdown */}
            <View style={{ marginBottom: verticalScale(20) }}>
              <Text
                className='font-medium text-gray-800'
                style={{
                  fontSize: moderateScale(14),
                  marginBottom: verticalScale(8),
                }}
              >
                Country <Text className='text-red-500'>*</Text>
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                className={`flex-row items-center justify-between rounded-lg border bg-white ${
                  errors.country ? 'border-red-500' : 'border-slate-300'
                }`}
                style={{
                  height: verticalScale(46),
                  paddingHorizontal: scale(14),
                }}
                onPress={() => setCountryDropdown(prev => !prev)}
              >
                <Text
                  style={{ fontSize: moderateScale(14) }}
                  className={
                    selectedCountry ? 'text-slate-800' : 'text-gray-400'
                  }
                >
                  {selectedCountry ? selectedCountry.name : 'Select country'}
                </Text>
                <Ionicons
                  name={countryDropdown ? 'chevron-up' : 'chevron-down'}
                  size={scale(18)}
                  color='#666'
                />
              </TouchableOpacity>

              {!!errors.country && (
                <Text
                  className='text-red-500'
                  style={{
                    fontSize: moderateScale(11),
                    marginTop: verticalScale(4),
                  }}
                >
                  {errors.country}
                </Text>
              )}

              {countryDropdown && (
                <View
                  className='overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'
                  style={{
                    maxHeight: verticalScale(220),
                    marginTop: verticalScale(6),
                  }}
                >
                  <TextInput
                    value={countrySearch}
                    onChangeText={setCountrySearch}
                    placeholder='Search country...'
                    placeholderTextColor='#9CA3AF'
                    style={{
                      fontSize: moderateScale(14),
                      paddingHorizontal: scale(12),
                      paddingVertical: verticalScale(8),
                    }}
                    className='border-b border-slate-100 text-slate-800'
                  />
                  <ScrollView
                    nestedScrollEnabled
                    keyboardShouldPersistTaps='handled'
                    showsVerticalScrollIndicator={false}
                  >
                    {filteredCountries.map(item => (
                      <TouchableOpacity
                        key={item.id}
                        className='flex-row items-center border-b border-gray-100'
                        style={{
                          minHeight: verticalScale(44),
                          paddingHorizontal: scale(14),
                        }}
                        onPress={() => {
                          setSelectedCountry(item);
                          setCountryDropdown(false);
                          setCountrySearch('');
                          setErrors(prev => ({ ...prev, country: '' }));
                        }}
                      >
                        <Text
                          style={{
                            fontSize: moderateScale(20),
                            marginRight: scale(10),
                          }}
                        >
                          {item.flag_emoji}
                        </Text>
                        <Text
                          className='text-slate-800'
                          style={{ fontSize: moderateScale(14) }}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Controls */}
            <View
              className='flex-row items-center justify-between'
              style={{ marginTop: verticalScale(28) }}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                className='flex-row items-center gap-2'
                style={{ paddingVertical: verticalScale(10) }}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name='arrow-back' size={scale(18)} color='#64748B' />
                <Text
                  className='font-semibold text-slate-500'
                  style={{ fontSize: moderateScale(13) }}
                >
                  Back to Sign Up
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleNextStepOne}
                className='flex-row items-center justify-center gap-2 rounded-lg bg-blue-600'
                style={{
                  height: verticalScale(44),
                  minWidth: scale(80),
                  paddingHorizontal: scale(18),
                }}
              >
                <Text
                  className='font-bold text-white'
                  style={{ fontSize: moderateScale(13) }}
                >
                  Next
                </Text>
                <Ionicons
                  name='arrow-forward'
                  size={scale(16)}
                  color='#FFFFFF'
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 2: TEAM SETUP */}
        {currentStep === 2 && (
          <View style={{ marginTop: verticalScale(32) }}>
            <View className='flex-row items-center gap-2'>
              <Text
                className='font-bold'
                style={{
                  color: colors.text || '#111827',
                  fontSize: moderateScale(20),
                }}
              >
                Invite your team
              </Text>
              <View className='rounded-full bg-slate-100 px-2.5 py-0.5'>
                <Text
                  className='font-medium text-slate-500'
                  style={{ fontSize: moderateScale(11) }}
                >
                  Optional
                </Text>
              </View>
            </View>
            <Text
              style={{
                color: colors.textSecondary || '#6B7280',
                fontSize: moderateScale(14),
                marginTop: verticalScale(6),
                marginBottom: verticalScale(20),
              }}
            >
              Add teammates now or invite them later from Settings.
            </Text>

            <View className='rounded-2xl border border-slate-100 bg-slate-50/50 p-4'>
              {teamMembers.map((member, index) => {
                const isRemovable = teamMembers.length > 1;

                return (
                  <View
                    key={member.id}
                    className='rounded-2xl border border-slate-100 bg-slate-50/50'
                    style={{
                      padding: scale(14),
                      marginBottom: verticalScale(12),
                    }}
                  >
                    <Text
                      className='font-bold uppercase tracking-wider text-slate-400'
                      style={{
                        fontSize: moderateScale(11),
                        marginBottom: verticalScale(8),
                      }}
                    >
                      MEMBER {index + 1}
                    </Text>

                    <View className='flex-row items-center gap-2.5'>
                      {/* Email Input */}
                      <View
                        className='shadow-xs flex-1 justify-center rounded-xl border border-slate-200 bg-white'
                        style={{
                          height: verticalScale(44),
                          paddingHorizontal: scale(12),
                        }}
                      >
                        <TextInput
                          value={member.email}
                          onChangeText={text =>
                            handleMemberEmailChange(text, index)
                          }
                          placeholder='teammate@company.com'
                          placeholderTextColor='#9CA3AF'
                          keyboardType='email-address'
                          autoCapitalize='none'
                          style={{ fontSize: moderateScale(13) }}
                          className='flex-1 text-slate-800'
                        />
                      </View>

                      {/* Delete / Clear Action Button */}
                      <TouchableOpacity
                        disabled={!isRemovable}
                        onPress={() => isRemovable && handleRemoveMember(index)}
                        activeOpacity={0.7}
                        className={`items-center justify-center rounded-xl border ${
                          isRemovable
                            ? 'border-red-200 bg-red-50/50'
                            : 'border-slate-100 bg-slate-100/50'
                        }`}
                        style={{
                          width: scale(44),
                          height: verticalScale(44),
                        }}
                      >
                        <Ionicons
                          name='close'
                          size={scale(18)}
                          color={isRemovable ? '#EF4444' : '#CBD5E1'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleAddMember}
                className='flex-row items-center justify-center rounded-xl border border-dashed border-blue-300 bg-white'
                style={{
                  height: verticalScale(44),
                  marginTop: verticalScale(8),
                  paddingHorizontal: scale(16),
                }}
              >
                <Ionicons name='add' size={scale(18)} color='#2563EB' />
                <Text
                  className='ml-1 font-semibold text-blue-600'
                  style={{ fontSize: moderateScale(13) }}
                >
                  Add Another Member
                </Text>
              </TouchableOpacity>
            </View>

            <View
              className='flex-row items-start rounded-2xl border border-blue-100 bg-blue-50/50 p-4'
              style={{ marginTop: verticalScale(16) }}
            >
              <Ionicons
                name='information-circle-outline'
                size={scale(20)}
                color='#2563EB'
                style={{ marginTop: 1, marginRight: scale(8) }}
              />
              <Text
                className='flex-1 text-blue-900'
                style={{
                  fontSize: moderateScale(12),
                  lineHeight: moderateScale(18),
                }}
              >
                Invitees will receive an email to join{' '}
                <Text className='font-bold'>
                  {organizationName.trim() || 'Workpilot'}
                </Text>{' '}
                on WorkPilot. You can manage team members any time from{' '}
                <Text className='font-bold'>Settings → Members</Text>.
              </Text>
            </View>

            <View
              className='flex-row items-center justify-between'
              style={{ marginTop: verticalScale(28) }}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                className='flex-row items-center gap-1.5'
                style={{ paddingVertical: verticalScale(10) }}
                onPress={() => setCurrentStep(1)}
              >
                <Ionicons
                  name='chevron-back'
                  size={scale(18)}
                  color='#64748B'
                />
                <Text
                  className='font-semibold text-slate-500'
                  style={{ fontSize: moderateScale(13) }}
                >
                  Back
                </Text>
              </TouchableOpacity>

              <View className='flex-row items-center gap-2.5'>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setCurrentStep(3)}
                  className='justify-center rounded-xl border border-slate-200 bg-white'
                  style={{
                    height: verticalScale(44),
                    paddingHorizontal: scale(14),
                  }}
                >
                  <Text
                    className='font-semibold text-slate-700'
                    style={{ fontSize: moderateScale(13) }}
                  >
                    Skip for now
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setCurrentStep(3)}
                  className='justify-center rounded-xl bg-blue-600'
                  style={{
                    height: verticalScale(44),
                    paddingHorizontal: scale(18),
                  }}
                >
                  <Text
                    className='font-semibold text-white'
                    style={{ fontSize: moderateScale(13) }}
                  >
                    Continue
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* STEP 3: BRANDING */}
        {currentStep === 3 && (
          <View style={{ marginTop: verticalScale(32) }}>
            <View className='flex-row items-center gap-2'>
              <Text
                className='font-bold'
                style={{
                  color: colors.text || '#111827',
                  fontSize: moderateScale(20),
                }}
              >
                Brand your workspace
              </Text>
              <View className='rounded-full bg-slate-100 px-2.5 py-0.5'>
                <Text
                  className='font-medium text-slate-500'
                  style={{ fontSize: moderateScale(11) }}
                >
                  Optional
                </Text>
              </View>
            </View>
            <Text
              style={{
                color: colors.textSecondary || '#6B7280',
                fontSize: moderateScale(14),
                marginTop: verticalScale(6),
                marginBottom: verticalScale(20),
              }}
            >
              Upload your logo and choose brand colors. You can always update
              this later.
            </Text>

            {/* Logo Upload Section */}
            <View style={{ marginBottom: verticalScale(20) }}>
              <Text
                className='font-semibold text-slate-800'
                style={{
                  fontSize: moderateScale(14),
                  marginBottom: verticalScale(8),
                }}
              >
                Company logo
              </Text>
              <View className='flex-row items-center gap-4'>
                <View
                  className='items-center justify-center rounded-2xl border border-slate-200 bg-slate-100'
                  style={{ width: scale(60), height: scale(60) }}
                >
                  <Ionicons
                    name='image-outline'
                    size={scale(26)}
                    color='#9CA3AF'
                  />
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleUploadLogo}
                  className='flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50'
                  style={{
                    height: scale(60),
                    paddingHorizontal: scale(12),
                  }}
                >
                  <View className='flex-row items-center gap-2'>
                    <Ionicons
                      name='cloud-upload-outline'
                      size={scale(18)}
                      color='#4B5563'
                    />
                    <Text
                      className='font-semibold text-slate-700'
                      style={{ fontSize: moderateScale(13) }}
                    >
                      {companyLogo ? companyLogo.name : 'Click to upload'}
                    </Text>
                  </View>
                  <Text
                    className='text-slate-400'
                    style={{
                      fontSize: moderateScale(11),
                      marginTop: verticalScale(2),
                    }}
                  >
                    PNG, JPG — up to 2 MB
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Live Preview Card */}
            <View
              className='flex-row items-center rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4'
              style={{ marginBottom: verticalScale(24) }}
            >
              <View
                style={{
                  backgroundColor: selectedColor,
                  width: scale(44),
                  height: scale(44),
                }}
                className='shadow-xs items-center justify-center rounded-xl'
              >
                <Text
                  className='font-bold text-white'
                  style={{ fontSize: moderateScale(18) }}
                >
                  {previewInitial}
                </Text>
              </View>
              <View
                className='flex-1 justify-center'
                style={{ marginLeft: scale(12) }}
              >
                <Text
                  className='font-bold text-slate-800'
                  style={{ fontSize: moderateScale(14) }}
                >
                  {organizationName.trim() || 'Your Organization'}
                </Text>
                <Text
                  className='text-slate-400'
                  style={{ fontSize: moderateScale(12) }}
                >
                  {organizationSlug.trim()
                    ? `${organizationSlug.trim()}.workpilot.app`
                    : 'workpilot.app/dashboard'}
                </Text>
              </View>
            </View>

            {/* Footer Buttons */}
            <View className='flex-row items-center justify-between'>
              <TouchableOpacity
                activeOpacity={0.7}
                className='flex-row items-center gap-1.5'
                style={{ paddingVertical: verticalScale(10) }}
                onPress={() => setCurrentStep(2)}
              >
                <Ionicons
                  name='chevron-back'
                  size={scale(18)}
                  color='#64748B'
                />
                <Text
                  className='font-semibold text-slate-500'
                  style={{ fontSize: moderateScale(13) }}
                >
                  Back
                </Text>
              </TouchableOpacity>

              <View className='flex-row items-center gap-2.5'>
                <TouchableOpacity
                  activeOpacity={0.7}
                  disabled={loading}
                  onPress={handleFinalSubmit}
                  className='justify-center rounded-xl border border-slate-200 bg-white'
                  style={{
                    height: verticalScale(44),
                    paddingHorizontal: scale(14),
                  }}
                >
                  <Text
                    className='font-semibold text-slate-700'
                    style={{ fontSize: moderateScale(13) }}
                  >
                    Skip for now
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={loading}
                  onPress={handleFinalSubmit}
                  className={`flex-row items-center justify-center gap-1.5 rounded-xl ${
                    loading ? 'bg-blue-400' : 'bg-blue-600'
                  }`}
                  style={{
                    height: verticalScale(44),
                    paddingHorizontal: scale(18),
                  }}
                >
                  <Text
                    className='font-semibold text-white'
                    style={{ fontSize: moderateScale(13) }}
                  >
                    {loading ? 'Submitting...' : 'Finish Setup'}
                  </Text>
                  {!loading && (
                    <Ionicons
                      name='arrow-forward'
                      size={scale(16)}
                      color='#FFFFFF'
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Options Selection Modal (Industry / Size) */}
      <Modal
        visible={dropdown !== null}
        transparent
        animationType='fade'
        onRequestClose={() => setDropdown(null)}
      >
        <Pressable
          className='flex-1 justify-end bg-black/35'
          onPress={() => setDropdown(null)}
        >
          <Pressable
            className='max-h-[70%] rounded-t-[20px] bg-white px-5'
            style={{
              paddingTop: verticalScale(18),
              paddingBottom: verticalScale(30),
            }}
            onPress={e => e.stopPropagation()}
          >
            <View
              className='flex-row items-center justify-between border-b border-slate-200'
              style={{
                marginBottom: verticalScale(6),
                paddingBottom: verticalScale(12),
              }}
            >
              <Text
                className='font-bold text-slate-800'
                style={{ fontSize: moderateScale(16) }}
              >
                {dropdownTitle}
              </Text>
              <TouchableOpacity onPress={() => setDropdown(null)}>
                <Ionicons name='close' size={scale(22)} color='#374151' />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {dropdownOptions.map(option => {
                const isSelected =
                  dropdown === 'industry'
                    ? industry === option
                    : organizationSize === option;

                return (
                  <TouchableOpacity
                    key={option}
                    className={`flex-row items-center justify-between border-b border-slate-100 px-2 ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                    style={{ minHeight: verticalScale(46) }}
                    onPress={() => {
                      if (dropdown === 'industry') {
                        setIndustry(option);
                      } else {
                        setOrganizationSize(option);
                      }
                      setDropdown(null);
                    }}
                  >
                    <Text
                      style={{ fontSize: moderateScale(14) }}
                      className={
                        isSelected
                          ? 'font-semibold text-blue-600'
                          : 'text-slate-700'
                      }
                    >
                      {option}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name='checkmark'
                        size={scale(20)}
                        color='#2563EB'
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Team Member Role Selection Modal */}
      <Modal
        visible={activeRoleModalIndex !== null}
        transparent
        animationType='fade'
        onRequestClose={() => setActiveRoleModalIndex(null)}
      >
        <Pressable
          className='flex-1 justify-end bg-black/35'
          onPress={() => setActiveRoleModalIndex(null)}
        >
          <Pressable
            className='rounded-t-[20px] bg-white px-5'
            style={{
              paddingTop: verticalScale(18),
              paddingBottom: verticalScale(30),
            }}
            onPress={e => e.stopPropagation()}
          >
            <View
              className='flex-row items-center justify-between border-b border-slate-200'
              style={{
                marginBottom: verticalScale(6),
                paddingBottom: verticalScale(12),
              }}
            >
              <Text
                className='font-bold text-slate-800'
                style={{ fontSize: moderateScale(16) }}
              >
                Select Member Role
              </Text>
              <TouchableOpacity onPress={() => setActiveRoleModalIndex(null)}>
                <Ionicons name='close' size={scale(22)} color='#374151' />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {ROLES.map(role => {
                const isSelected =
                  activeRoleModalIndex !== null &&
                  teamMembers[activeRoleModalIndex]?.role === role;

                return (
                  <TouchableOpacity
                    key={role}
                    className={`flex-row items-center justify-between border-b border-slate-100 px-2 ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                    style={{ minHeight: verticalScale(46) }}
                    onPress={() => {
                      if (activeRoleModalIndex !== null) {
                        handleRoleSelect(role, activeRoleModalIndex);
                      }
                    }}
                  >
                    <Text
                      style={{ fontSize: moderateScale(14) }}
                      className={
                        isSelected
                          ? 'font-semibold text-blue-600'
                          : 'text-slate-700'
                      }
                    >
                      {role}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name='checkmark'
                        size={scale(20)}
                        color='#2563EB'
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default Organization;
