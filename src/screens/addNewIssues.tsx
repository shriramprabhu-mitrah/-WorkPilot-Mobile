import React, { useState } from 'react';
import { ScrollView, View, TextInput, TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import OptionButton from '../components/common/Button/OptionButton';
import PriorityButton from '../components/common/Button/PriorityButton';
import NumberButton from '../components/common/Button/NumberButton';
import AssigneeButton from '../components/common/Button/AssigneButton';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import {
  assignees,
  issueTypes,
  priorities,
  projects,
  storyPoints,
} from '../data/addNewIssuesData';

const AddNewIssues = () => {
  const [project, setProject] = useState('CLOUD');
  const [issueType, setIssueType] = useState('Story');
  const [priority, setPriority] = useState<string>('Medium');
  const [assignee, setAssignee] = useState('Unassigned');
  const [storyPoint, setStoryPoint] = useState('3');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const { layout, moderateScale } = useAuthLayout();

  const handleCreate = () => {
    navigation.navigate('HomeTabs', { screen: 'Projects' });
  };

  return (
    <Screen scroll={false} backgroundColor={colors.background}>
      {/* Header Bar */}
      <View
        className='flex-row items-center justify-between border-b'
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
          height: moderateScale(56),
          paddingHorizontal: layout.paddingHorizontal,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            navigation.navigate('HomeTabs', { screen: 'Projects' })
          }
        >
          <Ionicons name='close' size={26} color={colors.text} />
        </TouchableOpacity>
        <AppText variant='h3' color={colors.text}>
          {strings.createIssue?.title || 'Create issue'}
        </AppText>
        <TouchableOpacity activeOpacity={0.7} onPress={handleCreate}>
          <AppText
            variant='bodyLarge'
            color={colors.primary}
            className='font-semibold'
          >
            {strings.createIssue?.createButton || 'Create'}
          </AppText>
        </TouchableOpacity>
      </View>
      {/* Form Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingVertical: layout.elementGap,
          paddingBottom: layout.largeSectionGap * 2,
        }}
      >
        {/* Project Section */}
        <AppText
          variant='bodyLarge'
          color={colors.text}
          className='font-semibold'
          style={{ marginBottom: layout.tightGap }}
        >
          {strings.createIssue?.projectLabel || 'Project'}
        </AppText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className='flex-row'
        >
          {projects.map((item: any) => (
            <OptionButton
              key={item.id}
              title={item.id}
              icon={item.icon}
              color={item.color}
              selected={project === item.id}
              onPress={() => setProject(item.id)}
            />
          ))}
        </ScrollView>
        {/* Issue Type Section */}
        <AppText
          variant='bodyLarge'
          color={colors.text}
          className='font-semibold'
          style={{
            marginTop: layout.sectionGap,
            marginBottom: layout.tightGap,
          }}
        >
          {strings.createIssue?.issueTypeLabel || 'Issue type'}
        </AppText>
        <View className='flex-row flex-wrap'>
          {issueTypes.map((item: any) => (
            <OptionButton
              key={item.id}
              title={item.id}
              icon={item.icon}
              color={item.color}
              selected={issueType === item.id}
              onPress={() => setIssueType(item.id)}
            />
          ))}
        </View>
        {/* Summary Input */}
        <View style={{ marginTop: layout.sectionGap }}>
          <View className='flex-row items-center'>
            <AppText
              variant='bodyLarge'
              color={colors.text}
              className='font-semibold'
            >
              {strings.createIssue?.summaryLabel || 'Summary'}
            </AppText>
            <AppText variant='bodyLarge' color={colors.error}>
              *
            </AppText>
          </View>

          <TextInput
            value={summary}
            onChangeText={setSummary}
            placeholder={
              strings.createIssue?.summaryPlaceholder ||
              'What needs to be done?'
            }
            placeholderTextColor={colors.placeholder}
            className='rounded-lg border p-3'
            style={{
              marginTop: layout.tightGap,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            }}
          />
        </View>

        {/* Description Input */}
        <View style={{ marginTop: layout.sectionGap }}>
          <AppText
            variant='bodyLarge'
            color={colors.text}
            className='font-semibold'
          >
            {strings.createIssue?.descriptionLabel || 'Description'}
          </AppText>
          <TextInput
            multiline
            textAlignVertical='top'
            value={description}
            onChangeText={setDescription}
            placeholder={
              strings.createIssue?.descriptionPlaceholder ||
              'Add a description...'
            }
            placeholderTextColor={colors.placeholder}
            className='rounded-lg border p-3'
            style={{
              marginTop: layout.tightGap,
              height: moderateScale(110),
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            }}
          />
        </View>
        {/* Priority Section */}
        <AppText
          variant='bodyLarge'
          color={colors.text}
          className='font-semibold'
          style={{
            marginTop: layout.sectionGap,
            marginBottom: layout.tightGap,
          }}
        >
          {strings.createIssue?.priorityLabel || 'Priority'}
        </AppText>
        <View className='flex-row justify-between'>
          {priorities.map((item: any) => (
            <PriorityButton
              key={item.type}
              title={item.type}
              color={item.color}
              selected={priority === item.type}
              onPress={() => setPriority(item.type)}
            />
          ))}
        </View>
        {/* Assignee Section */}
        <AppText
          variant='bodyLarge'
          color={colors.text}
          className='font-semibold'
          style={{
            marginTop: layout.sectionGap,
            marginBottom: layout.tightGap,
          }}
        >
          {strings.createIssue?.assigneeLabel || 'Assignee'}
        </AppText>
        <View className='flex-row flex-wrap'>
          {assignees.map((item: any) => (
            <AssigneeButton
              key={item}
              title={item}
              selected={assignee === item}
              onPress={() => setAssignee(item)}
            />
          ))}
        </View>
        {/* Story Points Section */}
        <AppText
          variant='bodyLarge'
          color={colors.text}
          className='font-semibold'
          style={{
            marginTop: layout.sectionGap,
            marginBottom: layout.tightGap,
          }}
        >
          {strings.createIssue?.storyPointsLabel || 'Story points'}
        </AppText>
        <View className='flex-row flex-wrap'>
          {storyPoints.map((item: any) => (
            <NumberButton
              key={item}
              title={item}
              selected={storyPoint === item}
              onPress={() => setStoryPoint(item)}
            />
          ))}
        </View>
        {/* Add Attachment Action */}
        <TouchableOpacity
          activeOpacity={0.7}
          className='flex-row items-center'
          style={{
            marginTop: layout.sectionGap,
            marginBottom: layout.elementGap,
          }}
        >
          <Ionicons name='image-outline' size={20} color={colors.primary} />
          <AppText
            variant='bodyLarge'
            color={colors.primary}
            className='font-semibold'
            style={{ marginLeft: layout.tightGap }}
          >
            {strings.createIssue?.addAttachment || 'Add attachment'}
          </AppText>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
};

export default AddNewIssues;
