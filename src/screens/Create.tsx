import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import CommonHeader from '../components/common/CommonHeader';
import AppText from '../components/common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import Screen from '../components/common/ScreenWapper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigationTypes';

export interface CreateScreenProps {}

export const CreateScreen: React.FC<CreateScreenProps> = ({}) => {
  const { colors } = useTheme();
  const { layout, moderateScale, isSmallHeight, hp } = useAuthLayout();

  // Form States
  const [selectedProject, setSelectedProject] = useState('Workpilot');
  const [selectedType, setSelectedType] = useState('Epic');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');

  // Dynamic collapse sections
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(true);
  const [isMoreFieldsOpen, setIsMoreFieldsOpen] = useState(true);

  // Field values
  const [assignee, setAssignee] = useState('Automatic');
  const [labels, setLabels] = useState('None');
  const [team, setTeam] = useState('None');
  const [dueDate, setDueDate] = useState('None');
  const [startDate, setStartDate] = useState('None');
  const [reporter, setReporter] = useState('Me');
  const [flagged, setFlagged] = useState('None');
  const [issueColor, setIssueColor] = useState('None');
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleSubmit = () => {
    const formData = {
      project: selectedProject,
      type: selectedType,
      summary,
      description,
      assignee,
      labels,
      team,
      dueDate,
      startDate,
      reporter,
      flagged,
      issueColor,
    };
    // if (onSubmit) onSubmit(formData);
  };

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.surface }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Header Row */}
        <CommonHeader
          variant='createProject'
          title='Create'
          onBackPress={() => navigation.goBack()}
          onRightActionPress={handleSubmit}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: layout.paddingHorizontal,
            paddingBottom: isSmallHeight ? hp(20) : hp(12),
            gap: 16,
          }}
        >
          {/* Project & Issue Type Selectors */}
          <View className='flex-row items-center py-2' style={{ gap: 8 }}>
            {/* Project Dropdown Pill */}
            <TouchableOpacity
              activeOpacity={0.7}
              className='flex-row items-center rounded-full border px-3 py-2'
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              <View
                className='mr-2 items-center justify-center rounded'
                style={{
                  width: moderateScale(22),
                  height: moderateScale(22),
                  backgroundColor: '#FF5722',
                }}
              >
                <Ionicons name='build-outline' size={13} color='#FFF' />
              </View>
              <AppText className='text-sm font-semibold' color={colors.text}>
                {selectedProject}
              </AppText>
              <Ionicons
                name='chevron-down'
                size={14}
                color={colors.textSecondary}
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>

            <Ionicons
              name='caret-forward'
              size={10}
              color={colors.textSecondary}
            />

            {/* Issue Type Dropdown Pill */}
            <TouchableOpacity
              activeOpacity={0.7}
              className='flex-row items-center rounded-full border border-neutral-800 px-3 py-2'
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              <View
                className='mr-2 items-center justify-center rounded'
                style={{
                  width: moderateScale(22),
                  height: moderateScale(22),
                  backgroundColor: '#9C27B0',
                }}
              >
                <Ionicons name='flash-outline' size={13} color='#FFF' />
              </View>
              <AppText className='text-sm font-semibold' color={colors.text}>
                {selectedType}
              </AppText>
              <Ionicons
                name='chevron-down'
                size={14}
                color={colors.textSecondary}
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>
          </View>

          {/* Summary Input Row */}
          <View className='flex-row items-center justify-between py-1'>
            <TextInput
              placeholder='Add a summary...'
              placeholderTextColor={colors.textSecondary || '#6B7280'}
              value={summary}
              onChangeText={setSummary}
              style={{
                flex: 1,
                color: colors.text,
                fontSize: moderateScale(20),
                fontWeight: '600',
                paddingVertical: 4,
              }}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              className='ml-2 items-center justify-center rounded-full'
              style={{
                width: moderateScale(32),
                height: moderateScale(32),
                backgroundColor: colors.surface,
              }}
            >
              <Ionicons
                name='person-outline'
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Description Card */}
          <View
            className='rounded-2xl border border-neutral-800 p-4'
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsDescriptionOpen(!isDescriptionOpen)}
              className='flex-row items-center justify-between'
            >
              <AppText className='text-base font-bold' color={colors.text}>
                Description
              </AppText>
              <Ionicons
                name={isDescriptionOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {isDescriptionOpen && (
              <TextInput
                placeholder='Add a description...'
                placeholderTextColor={colors.textSecondary || '#6B7280'}
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical='top'
                style={{
                  color: colors.text,
                  fontSize: moderateScale(15),
                  minHeight: 60,
                  marginTop: 12,
                  padding: 0,
                }}
              />
            )}
          </View>

          {/* Attachments Card */}
          <View
            className='rounded-2xl border border-neutral-800 p-4'
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsAttachmentsOpen(!isAttachmentsOpen)}
              className='flex-row items-center justify-between'
            >
              <AppText className='text-base font-bold' color={colors.text}>
                Attachments
              </AppText>
              <Ionicons
                name={isAttachmentsOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {isAttachmentsOpen && (
              <TouchableOpacity
                activeOpacity={0.8}
                className='mt-3 flex-row items-center self-start rounded-xl border border-neutral-700 px-4 py-2.5'
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                }}
              >
                <Ionicons name='add' size={18} color={colors.text} />
                <AppText className='ml-1.5 font-semibold' color={colors.text}>
                  Add attachment
                </AppText>
              </TouchableOpacity>
            )}
          </View>

          {/* More Fields Card */}
          <View
            className='rounded-2xl border border-neutral-800 p-4'
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              gap: 18,
            }}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsMoreFieldsOpen(!isMoreFieldsOpen)}
              className='flex-row items-center justify-between'
            >
              <AppText className='text-base font-bold' color={colors.text}>
                More fields
              </AppText>
              <Ionicons
                name={isMoreFieldsOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>

            {isMoreFieldsOpen && (
              <View style={{ gap: 18 }}>
                {/* Assignee */}
                <View>
                  <AppText
                    className='mb-1.5 text-xs'
                    color={colors.textSecondary}
                  >
                    Assignee
                  </AppText>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className='flex-row items-center self-start rounded-full border border-neutral-700 px-3 py-1.5'
                    style={{
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    }}
                  >
                    <Ionicons
                      name='person-outline'
                      size={14}
                      color={colors.textSecondary}
                    />
                    <AppText
                      className='ml-1.5 text-sm font-semibold'
                      color={colors.text}
                    >
                      {assignee}
                    </AppText>
                  </TouchableOpacity>
                </View>

                {/* Labels */}
                <TouchableOpacity activeOpacity={0.7}>
                  <AppText
                    className='mb-1 text-xs'
                    color={colors.textSecondary}
                  >
                    Labels
                  </AppText>
                  <AppText className='text-sm' color={colors.textSecondary}>
                    {labels}
                  </AppText>
                </TouchableOpacity>

                {/* Team */}
                <TouchableOpacity activeOpacity={0.7}>
                  <AppText
                    className='mb-1 text-xs'
                    color={colors.textSecondary}
                  >
                    Team
                  </AppText>
                  <AppText className='text-sm' color={colors.textSecondary}>
                    {team}
                  </AppText>
                </TouchableOpacity>

                {/* Due date */}
                <TouchableOpacity activeOpacity={0.7}>
                  <AppText
                    className='mb-1 text-xs'
                    color={colors.textSecondary}
                  >
                    Due date
                  </AppText>
                  <AppText className='text-sm' color={colors.textSecondary}>
                    {dueDate}
                  </AppText>
                </TouchableOpacity>

                {/* Start date */}
                <TouchableOpacity activeOpacity={0.7}>
                  <AppText
                    className='mb-1 text-xs'
                    color={colors.textSecondary}
                  >
                    Start date
                  </AppText>
                  <AppText className='text-sm' color={colors.textSecondary}>
                    {startDate}
                  </AppText>
                </TouchableOpacity>

                {/* Reporter (Required Field) */}
                <View>
                  <View className='mb-1.5 flex-row items-center'>
                    <AppText className='text-xs' color={colors.textSecondary}>
                      Reporter
                    </AppText>
                    <AppText className='ml-0.5 text-xs' color='#EF4444'>
                      *
                    </AppText>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    className='flex-row items-center self-start rounded-full border border-neutral-700 px-3 py-1.5'
                    style={{
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    }}
                  >
                    <View
                      className='mr-2 items-center justify-center rounded-full'
                      style={{
                        width: moderateScale(18),
                        height: moderateScale(18),
                        backgroundColor: colors.accentOrange || '#F97316',
                      }}
                    >
                      <AppText className='text-[10px] font-bold' color='#FFF'>
                        H
                      </AppText>
                    </View>
                    <AppText
                      className='text-sm font-semibold'
                      color={colors.text}
                    >
                      {reporter}
                    </AppText>
                  </TouchableOpacity>
                </View>

                {/* Flagged */}
                <TouchableOpacity activeOpacity={0.7}>
                  <AppText
                    className='mb-1 text-xs'
                    color={colors.textSecondary}
                  >
                    Flagged
                  </AppText>
                  <AppText className='text-sm' color={colors.textSecondary}>
                    {flagged}
                  </AppText>
                </TouchableOpacity>

                {/* Issue color */}
                <TouchableOpacity activeOpacity={0.7}>
                  <AppText
                    className='mb-1 text-xs'
                    color={colors.textSecondary}
                  >
                    Issue color
                  </AppText>
                  <AppText className='text-sm' color={colors.textSecondary}>
                    {issueColor}
                  </AppText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

export default CreateScreen;
