import React, { useState } from 'react';
import {
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
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
  AssigneeItem,
  assignees,
  IssueTypeItem,
  issueTypes,
  priorities,
  PriorityItem,
  ProjectItem,
  projects,
  storyPoints,
} from '../data/addNewIssuesData';
import { Radius } from '../constants/Radius';

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
      <View
        className='flex-row items-center justify-between border-b'
        style={{
          backgroundColor: colors.card || colors.surface,
          borderColor: colors.border,
          paddingHorizontal: layout.paddingHorizontal,
          paddingVertical: layout.largeSectionGap,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name='close' size={24} color={colors.text} />
        </TouchableOpacity>
        <AppText variant='title' color={colors.text} className='font-bold'>
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingVertical: layout.elementGap,
          paddingBottom: layout.largeSectionGap * 2,
        }}
      >
        <AppText
          variant='bodyLarge'
          color={colors.text}
          className='font-bold'
          style={{ paddingBottom: layout.largeSectionGap }}
        >
          {strings.createIssue?.projectLabel || 'Project'}
        </AppText>
        <FlatList
          data={projects}
          horizontal
          keyExtractor={item => item?.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }: { item: ProjectItem }) => (
            <OptionButton
              title={item?.id}
              icon={item?.icon}
              color={item?.color}
              selected={project === item?.id}
              onPress={() => setProject(item?.id)}
            />
          )}
          contentContainerStyle={{ gap: layout.sectionGap }}
        />
        <AppText
          variant='bodyLarge'
          color={colors.text}
          className='font-bold'
          style={{
            marginTop: layout.sectionGap,
            marginBottom: layout.largeSectionGap,
          }}
        >
          {strings.createIssue?.issueTypeLabel || 'Issue type'}
        </AppText>
        <View className='flex-row flex-wrap' style={{ gap: layout.sectionGap }}>
          {issueTypes.map((item: IssueTypeItem) => (
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
        <View
          className='gap-1'
          style={{
            paddingTop: layout.largeSectionGap,
            paddingBottom: layout?.largeSectionGap,
          }}
        >
          <View
            className='flex-row items-center'
            style={{ gap: layout.elementGap }}
          >
            <AppText
              variant='bodyLarge'
              color={colors.text}
              className='font-bold'
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
            className='border'
            style={{
              borderRadius: Radius.xs,
              paddingHorizontal: layout.paddingHorizontal * 0.5,
              marginTop: layout.tightGap,
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            }}
          />
        </View>
        <View
          style={{
            paddingVertical: layout?.largeSectionGap,
            gap: layout.tightGap,
          }}
        >
          <AppText
            variant='bodyLarge'
            color={colors.text}
            className='font-bold'
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
            className='rounded-lg border'
            style={{
              borderRadius: Radius.xs,
              paddingHorizontal: layout.paddingHorizontal * 0.5,
              marginTop: layout.tightGap,
              height: moderateScale(110),
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            }}
          />
        </View>
        <AppText
          variant='bodyLarge'
          color={colors.text}
          className='font-bold'
          style={{
            paddingVertical: layout?.largeSectionGap,
          }}
        >
          {strings.createIssue?.priorityLabel || 'Priority'}
        </AppText>
        <View
          style={{ gap: layout.tightGap }}
          className='flex-row flex-wrap justify-between'
        >
          {priorities.map((item: PriorityItem) => (
            <PriorityButton
              key={item.type}
              title={item.type}
              color={item.color}
              selected={priority === item.type}
              onPress={() => setPriority(item.type)}
            />
          ))}
        </View>
        <AppText
          variant='bodyLarge'
          color={colors.text}
          className='font-bold'
          style={{
            paddingTop: layout.largeSectionGap,
            paddingBottom: layout.largeSectionGap,
          }}
        >
          {strings.createIssue?.assigneeLabel || 'Assignee'}
        </AppText>
        <View style={{ gap: layout.sectionGap }} className='flex-row flex-wrap'>
          {assignees.map((item: string) => (
            <AssigneeButton
              key={item}
              title={item}
              selected={assignee === item}
              onPress={() => setAssignee(item)}
            />
          ))}
        </View>
        <AppText
          variant='bodyLarge'
          color={colors.text}
          className='font-bold'
          style={{
            paddingTop: layout.largeSectionGap,
            paddingBottom: layout.largeSectionGap,
          }}
        >
          {strings.createIssue?.storyPointsLabel || 'Story points'}
        </AppText>
        <View className='flex-row flex-wrap'>
          {storyPoints.map((item: string) => (
            <NumberButton
              key={item}
              title={item}
              selected={storyPoint === item}
              onPress={() => setStoryPoint(item)}
            />
          ))}
        </View>
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
            className='font-bold'
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
