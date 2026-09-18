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
        contentContainerStyle={{ paddingBottom: 40 }}
        className='px-6'
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className='items-center pt-20'>
          <HeaderIcon />
          <Text
            className='text-center text-[27px] font-bold'
            style={{ color: colors.text || '#111827' }}
          >
            Welcome to WorkPilot
          </Text>
          <Text
            className='mt-2 text-center text-sm leading-[21px]'
            style={{ color: colors.textSecondary || '#6B7280' }}
          >
            You are just a few steps away from creating your team's workspace.
          </Text>
        </View>

        {/* Dynamic Progress Bar */}
        <View className='mt-6'>
          <View className='h-[7px] overflow-hidden rounded-full bg-gray-200'>
            <LinearGradient
              colors={['#2563EB', '#7C3AED']} // Blue to Purple gradient
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

          <View className='mt-3 flex-row items-start justify-between'>
            {/* Step 1 Indicator */}
            <View className='w-[70px] items-center'>
              <View className='h-8 w-8 items-center justify-center rounded-full bg-blue-600'>
                <Text className='text-[13px] font-bold text-white'>1</Text>
              </View>
              <Text className='mt-[7px] text-center text-[11px] font-semibold text-blue-600'>
                Organization
              </Text>
            </View>

            <View
              className={`mt-4 h-px flex-1 ${
                currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />

            {/* Step 2 Indicator */}
            <View className='w-[70px] items-center'>
              <View
                className={`h-8 w-8 items-center justify-center rounded-full ${
                  currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-[13px] ${
                    currentStep >= 2
                      ? 'font-bold text-white'
                      : 'font-semibold text-gray-400'
                  }`}
                >
                  2
                </Text>
              </View>
              <Text
                className={`mt-[7px] text-center text-[11px] ${
                  currentStep >= 2
                    ? 'font-semibold text-blue-600'
                    : 'text-slate-400'
                }`}
              >
                Team Setup (opt)
              </Text>
            </View>

            <View
              className={`mt-4 h-px flex-1 ${
                currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />

            {/* Step 3 Indicator */}
            <View className='w-[70px] items-center'>
              <View
                className={`h-8 w-8 items-center justify-center rounded-full ${
                  currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-[13px] ${
                    currentStep >= 3
                      ? 'font-bold text-white'
                      : 'font-semibold text-gray-400'
                  }`}
                >
                  3
                </Text>
              </View>
              <Text
                className={`mt-[7px] text-center text-[11px] ${
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
          <View className='mt-11'>
            <Text
              className='text-[21px] font-bold'
              style={{ color: colors.text || '#111827' }}
            >
              Set up your organization
            </Text>
            <Text
              className='mb-[30px] mt-[7px] text-sm'
              style={{ color: colors.textSecondary || '#6B7280' }}
            >
              This step is required to access your workspace.
            </Text>

            {/* Organization Name */}
            <View className='mb-[22px]'>
              <Text className='mb-2 text-sm font-medium text-gray-800'>
                Organization name <Text className='text-red-500'>*</Text>
              </Text>
              <TextInput
                value={organizationName}
                onChangeText={handleOrganizationNameChange}
                placeholder='e.g. Acme Corp'
                placeholderTextColor='#9CA3AF'
                className={`h-11 rounded-lg border bg-white px-[14px] text-sm text-slate-800 ${
                  errors.organizationName
                    ? 'border-red-500'
                    : 'border-slate-300'
                }`}
              />
              {!!errors.organizationName && (
                <Text className='mt-[5px] text-[11px] text-red-500'>
                  {errors.organizationName}
                </Text>
              )}
            </View>

            {/* Domain Field */}
            <View className='mb-[22px]'>
              <Text className='mb-2 text-sm font-medium text-gray-800'>
                Organization URL <Text className='text-red-500'>*</Text>
              </Text>
              <View
                className={`h-11 flex-row overflow-hidden rounded-lg border bg-white ${
                  errors.organizationSlug
                    ? 'border-red-500'
                    : 'border-slate-300'
                }`}
              >
                <View className='justify-center border-r border-slate-300 bg-slate-50 px-[14px]'>
                  <Text className='text-[13px] text-slate-500'>
                    workpilot.app/
                  </Text>
                </View>
                <TextInput
                  value={organizationSlug}
                  onChangeText={handleSlugChange}
                  placeholder='acme-corp'
                  placeholderTextColor='#9CA3AF'
                  autoCapitalize='none'
                  className='flex-1 px-3 text-sm text-slate-800'
                />
              </View>
              {!!errors.organizationSlug && (
                <Text className='mt-[5px] text-[11px] text-red-500'>
                  {errors.organizationSlug}
                </Text>
              )}
            </View>

            {/* Industry + Team Size */}
            <View className='mb-[22px] flex-row gap-5'>
              <View className='flex-1'>
                <Text className='mb-2 text-sm font-medium text-gray-800'>
                  Industry <Text className='text-red-500'>*</Text>
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  className='h-11 flex-row items-center justify-between rounded-lg border border-slate-300 bg-white px-[13px]'
                  onPress={() => setDropdown('industry')}
                >
                  <Text className='text-sm text-slate-800' numberOfLines={1}>
                    {industry}
                  </Text>
                  <Ionicons name='chevron-down' size={18} color='#374151' />
                </TouchableOpacity>
              </View>

              <View className='flex-1'>
                <Text className='mb-2 text-sm font-medium text-gray-800'>
                  Team size <Text className='text-red-500'>*</Text>
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  className='h-11 flex-row items-center justify-between rounded-lg border border-slate-300 bg-white px-[13px]'
                  onPress={() => setDropdown('size')}
                >
                  <Text className='text-sm text-slate-800'>
                    {organizationSize}
                  </Text>
                  <Ionicons name='chevron-down' size={18} color='#374151' />
                </TouchableOpacity>
              </View>
            </View>

            {/* Country Dropdown */}
            <View className='mb-5'>
              <Text className='mb-2 text-sm font-medium text-gray-800'>
                Country <Text className='text-red-500'>*</Text>
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                className={`h-[50px] flex-row items-center justify-between rounded-lg border bg-white px-[14px] ${
                  errors.country ? 'border-red-500' : 'border-slate-300'
                }`}
                onPress={() => setCountryDropdown(prev => !prev)}
              >
                <Text
                  className={`text-sm ${
                    selectedCountry ? 'text-slate-800' : 'text-gray-400'
                  }`}
                >
                  {selectedCountry ? selectedCountry.name : 'Select country'}
                </Text>
                <Ionicons
                  name={countryDropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color='#666'
                />
              </TouchableOpacity>

              {!!errors.country && (
                <Text className='mt-[5px] text-[11px] text-red-500'>
                  {errors.country}
                </Text>
              )}

              {countryDropdown && (
                <View className='mt-[5px] max-h-[250px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm'>
                  <TextInput
                    value={countrySearch}
                    onChangeText={setCountrySearch}
                    placeholder='Search country...'
                    placeholderTextColor='#9CA3AF'
                    className='border-b border-slate-100 px-3 py-2 text-sm text-slate-800'
                  />
                  <ScrollView
                    nestedScrollEnabled
                    keyboardShouldPersistTaps='handled'
                    showsVerticalScrollIndicator={false}
                  >
                    {filteredCountries.map(item => (
                      <TouchableOpacity
                        key={item.id}
                        className='min-h-12 flex-row items-center border-b border-gray-100 px-[14px]'
                        onPress={() => {
                          setSelectedCountry(item);
                          setCountryDropdown(false);
                          setCountrySearch('');
                          setErrors(prev => ({ ...prev, country: '' }));
                        }}
                      >
                        <Text className='mr-3 text-[22px]'>
                          {item.flag_emoji}
                        </Text>
                        <Text className='text-sm text-slate-800'>
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Controls */}
            <View className='mt-8 flex-row items-center justify-between'>
              <TouchableOpacity
                activeOpacity={0.7}
                className='flex-row items-center gap-[7px] py-3'
                onPress={() => navigation.goBack()}
              >
                <Ionicons name='arrow-back' size={18} color='#64748B' />
                <Text className='text-[13px] font-semibold text-slate-500'>
                  Back to Sign Up
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleNextStepOne}
                className='h-11 min-w-[76px] flex-row items-center justify-center gap-[7px] rounded-lg bg-blue-600 px-[18px]'
              >
                <Text className='text-[13px] font-bold text-white'>Next</Text>
                <Ionicons name='arrow-forward' size={17} color='#FFFFFF' />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 2: TEAM SETUP */}
        {currentStep === 2 && (
          <View className='mt-11'>
            <View className='flex-row items-center gap-2.5'>
              <Text
                className='text-[21px] font-bold'
                style={{ color: colors.text || '#111827' }}
              >
                Invite your team
              </Text>
              <View className='rounded-full bg-slate-100 px-2.5 py-0.5'>
                <Text className='text-xs font-medium text-slate-500'>
                  Optional
                </Text>
              </View>
            </View>
            <Text
              className='mb-[24px] mt-[7px] text-sm'
              style={{ color: colors.textSecondary || '#6B7280' }}
            >
              Add teammates now or invite them later from Settings.
            </Text>

            <View className='rounded-2xl border border-slate-100 bg-slate-50/50 p-4'>
              {teamMembers.map((member, index) => {
                const isRemovable = teamMembers.length > 1;

                return (
                  <View
                    key={member.id}
                    className='rounded-2xl border border-slate-100 bg-slate-50/50 p-4'
                  >
                    <Text className='mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400'>
                      MEMBER {index + 1}
                    </Text>

                    <View className='flex-row items-center gap-2.5'>
                      {/* Email Input */}
                      <View className='shadow-xs h-11 flex-1 justify-center rounded-xl border border-slate-200 bg-white px-3'>
                        <TextInput
                          value={member.email}
                          onChangeText={text =>
                            handleMemberEmailChange(text, index)
                          }
                          placeholder='teammate@company.com'
                          placeholderTextColor='#9CA3AF'
                          keyboardType='email-address'
                          autoCapitalize='none'
                          className='flex-1 text-sm text-slate-800'
                        />
                      </View>

                      {/* Delete / Clear Action Button */}
                      <TouchableOpacity
                        disabled={!isRemovable}
                        onPress={() => isRemovable && handleRemoveMember(index)}
                        activeOpacity={0.7}
                        className={`h-11 w-11 items-center justify-center rounded-xl border ${
                          isRemovable
                            ? 'border-red-200 bg-red-50/50'
                            : 'border-slate-100 bg-slate-100/50'
                        }`}
                      >
                        <Ionicons
                          name='close'
                          size={18}
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
                className='mt-2 h-11 flex-row items-center justify-center rounded-xl border border-dashed border-blue-300 bg-white px-4'
              >
                <Ionicons name='add' size={18} color='#2563EB' />
                <Text className='ml-1 text-sm font-semibold text-blue-600'>
                  Add Another Member
                </Text>
              </TouchableOpacity>
            </View>

            <View className='mt-4 flex-row items-start rounded-2xl border border-blue-100 bg-blue-50/50 p-4'>
              <Ionicons
                name='information-circle-outline'
                size={20}
                color='#2563EB'
                style={{ marginTop: 1, marginRight: 10 }}
              />
              <Text className='flex-1 text-xs leading-[18px] text-blue-900'>
                Invitees will receive an email to join{' '}
                <Text className='font-bold'>
                  {organizationName.trim() || 'Workpilot'}
                </Text>{' '}
                on WorkPilot. You can manage team members any time from{' '}
                <Text className='font-bold'>Settings → Members</Text>.
              </Text>
            </View>

            <View className='mt-8 flex-row items-center justify-between'>
              <TouchableOpacity
                activeOpacity={0.7}
                className='flex-row items-center gap-1.5 py-3'
                onPress={() => setCurrentStep(1)}
              >
                <Ionicons name='chevron-back' size={18} color='#64748B' />
                <Text className='text-sm font-semibold text-slate-500'>
                  Back
                </Text>
              </TouchableOpacity>

              <View className='flex-row items-center gap-2.5'>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setCurrentStep(3)}
                  className='h-11 justify-center rounded-xl border border-slate-200 bg-white px-4'
                >
                  <Text className='text-sm font-semibold text-slate-700'>
                    Skip for now
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setCurrentStep(3)}
                  className='h-11 justify-center rounded-xl bg-blue-600 px-5'
                >
                  <Text className='text-sm font-semibold text-white'>
                    Continue
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* STEP 3: BRANDING */}
        {currentStep === 3 && (
          <View className='mt-11'>
            <View className='flex-row items-center gap-2.5'>
              <Text
                className='text-[21px] font-bold'
                style={{ color: colors.text || '#111827' }}
              >
                Brand your workspace
              </Text>
              <View className='rounded-full bg-slate-100 px-2.5 py-0.5'>
                <Text className='text-xs font-medium text-slate-500'>
                  Optional
                </Text>
              </View>
            </View>
            <Text
              className='mb-6 mt-[7px] text-sm'
              style={{ color: colors.textSecondary || '#6B7280' }}
            >
              Upload your logo and choose brand colors. You can always update
              this later.
            </Text>

            {/* Logo Upload Section */}
            <View className='mb-6'>
              <Text className='mb-2 text-sm font-semibold text-slate-800'>
                Company logo
              </Text>
              <View className='flex-row items-center gap-4'>
                <View className='h-[60px] w-[60px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-100'>
                  <Ionicons name='image-outline' size={26} color='#9CA3AF' />
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleUploadLogo}
                  className='h-[60px] flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 px-4'
                >
                  <View className='flex-row items-center gap-2'>
                    <Ionicons
                      name='cloud-upload-outline'
                      size={18}
                      color='#4B5563'
                    />
                    <Text className='text-sm font-semibold text-slate-700'>
                      {companyLogo ? companyLogo.name : 'Click to upload'}
                    </Text>
                  </View>
                  <Text className='mt-0.5 text-[11px] text-slate-400'>
                    PNG, JPG — up to 2 MB
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Live Preview Card */}
            <View className='mb-8 flex-row items-center rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4'>
              <View
                style={{ backgroundColor: selectedColor }}
                className='shadow-xs h-11 w-11 items-center justify-center rounded-xl'
              >
                <Text className='text-lg font-bold text-white'>
                  {previewInitial}
                </Text>
              </View>
              <View className='ml-3 flex-1 justify-center'>
                <Text className='text-sm font-bold text-slate-800'>
                  {organizationName.trim() || 'Your Organization'}
                </Text>
                <Text className='text-xs text-slate-400'>
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
                className='flex-row items-center gap-1.5 py-3'
                onPress={() => setCurrentStep(2)}
              >
                <Ionicons name='chevron-back' size={18} color='#64748B' />
                <Text className='text-sm font-semibold text-slate-500'>
                  Back
                </Text>
              </TouchableOpacity>

              <View className='flex-row items-center gap-2.5'>
                <TouchableOpacity
                  activeOpacity={0.7}
                  disabled={loading}
                  onPress={handleFinalSubmit}
                  className='h-11 justify-center rounded-xl border border-slate-200 bg-white px-4'
                >
                  <Text className='text-sm font-semibold text-slate-700'>
                    Skip for now
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={loading}
                  onPress={handleFinalSubmit}
                  className={`h-11 flex-row items-center justify-center gap-1.5 rounded-xl px-5 ${
                    loading ? 'bg-blue-400' : 'bg-blue-600'
                  }`}
                >
                  <Text className='text-sm font-semibold text-white'>
                    {loading ? 'Submitting...' : 'Finish Setup'}
                  </Text>
                  {!loading && (
                    <Ionicons name='arrow-forward' size={16} color='#FFFFFF' />
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
            className='max-h-[70%] rounded-t-[20px] bg-white px-5 pb-[30px] pt-[18px]'
            onPress={e => e.stopPropagation()}
          >
            <View className='mb-[5px] flex-row items-center justify-between border-b border-slate-200 pb-[15px]'>
              <Text className='text-[17px] font-bold text-slate-800'>
                {dropdownTitle}
              </Text>
              <TouchableOpacity onPress={() => setDropdown(null)}>
                <Ionicons name='close' size={22} color='#374151' />
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
                    className={`min-h-12 flex-row items-center justify-between border-b border-slate-100 px-2 ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
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
                      className={`text-sm ${
                        isSelected
                          ? 'font-semibold text-blue-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {option}
                    </Text>
                    {isSelected && (
                      <Ionicons name='checkmark' size={20} color='#2563EB' />
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
            className='rounded-t-[20px] bg-white px-5 pb-[30px] pt-[18px]'
            onPress={e => e.stopPropagation()}
          >
            <View className='mb-[5px] flex-row items-center justify-between border-b border-slate-200 pb-[15px]'>
              <Text className='text-[17px] font-bold text-slate-800'>
                Select Member Role
              </Text>
              <TouchableOpacity onPress={() => setActiveRoleModalIndex(null)}>
                <Ionicons name='close' size={22} color='#374151' />
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
                    className={`min-h-12 flex-row items-center justify-between border-b border-slate-100 px-2 ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                    onPress={() => {
                      if (activeRoleModalIndex !== null) {
                        handleRoleSelect(role, activeRoleModalIndex);
                      }
                    }}
                  >
                    <Text
                      className={`text-sm ${
                        isSelected
                          ? 'font-semibold text-blue-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {role}
                    </Text>
                    {isSelected && (
                      <Ionicons name='checkmark' size={20} color='#2563EB' />
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
