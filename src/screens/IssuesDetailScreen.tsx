import React, { useMemo, useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AppText from '../components/common/AppText';
import Avatar from '../components/Avatar';
import Screen from '../components/common/ScreenWapper';
import { AppInput } from '../components';
import PopupModel from '../components/Model';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { RootStackParamList } from '../types/navigationTypes';
import { Radius } from '../constants/Radius';
import { RootState, useAppDispatch, useAppSelector } from '../store';
import {
  setDescription,
  setIsEditingDescription,
  setIssues,
} from '../store/issue_store/reducer/issue.reducer';
import {
  getComments,
  getDetails,
  subtasks,
  statusOptions,
  getStatusColors,
  getMyIssues,
  Issue,
  Comment,
} from '../data/issuesDetailsScreenData';

const IssueDetailScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const issueId = route.params?.id;
  const { colors } = useTheme();
  const { layout, isSmallHeight, hp } = useAuthLayout();
  const dispatch = useAppDispatch();
  const myIssues = useMemo(() => getMyIssues(colors), [colors]);
  const { issues, isEditingDescription } = useAppSelector(
    (state: RootState) => state.issue,
  );
  const issue = issues.find((item: Issue) => item.id === issueId);
  const currentDescription = issue?.description ?? '';
  const [comment, setComment] = useState<string>('');
  const [status, setStatus] = useState(issue?.status);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [subtaskDone, setSubtaskDone] = useState<Record<string, boolean>>({
    'CLOUD-330a': true,
  });

  useEffect(() => {
    if (issues.length === 0) {
      dispatch(setIssues(myIssues));
    }
  }, [dispatch, issues.length, myIssues]);

  const comments = useMemo(() => getComments(colors), [colors]);
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const details = useMemo(() => getDetails(colors), [colors]);
  const statusColors = useMemo(() => getStatusColors(colors), [colors]);
  const handleOpenEditModal = () => {
    dispatch(setIsEditingDescription(true));
  };
  const handleCloseEditModal = () => {
    dispatch(setIsEditingDescription(false));
  };
  const handleSaveDescription = (newDescription: string) => {
    if (!issueId) return;
    dispatch(
      setDescription({
        issueId,
        description: newDescription,
      }),
    );
    dispatch(setIsEditingDescription(false));
  };
  const handleSendComment = () => {
    if (!comment.trim()) return;
    const newComment = {
      id: Date.now(),
      author: 'Alex Johnson',
      avatar: 'AJ',
      color: colors.warning || colors.primary,
      time: 'Just now',
      text: comment.trim(),
    };
    setLocalComments((prev: Comment[]) => [...prev, newComment]);
    setComment('');
  };
  const completedCount = subtasks.filter(item => {
    return subtaskDone[item.id] !== undefined
      ? subtaskDone[item.id]
      : item.done;
  }).length;

  const totalCount = subtasks.length;
  const allSelected = subtasks.every(
    item => (subtaskDone[item.id] ?? item.done) === true,
  );
  const handleSelectAll = () => {
    const updatedState: Record<string, boolean> = {};
    subtasks.forEach(item => {
      updatedState[item.id] = !allSelected;
    });
    setSubtaskDone(updatedState);
  };

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <View
        className='flex-row items-center justify-between border-b'
        style={{
          backgroundColor: colors.card || colors.surface,
          borderColor: colors.border,
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: layout.paddingBottom,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name='arrow-back'
            size={layout.iconSize}
            color={colors.text}
          />
        </TouchableOpacity>
        <View
          className='flex-row items-center'
          style={{ gap: layout.largeSectionGap }}
        >
          <AppText
            variant='body'
            color={colors.textSecondary}
            className='font-semibold'
          >
            {issue?.id}
          </AppText>
          <TouchableOpacity>
            <Ionicons
              name='ellipsis-horizontal'
              size={layout.iconSize}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        <View
          className='border-b'
          style={{
            backgroundColor: colors.card || colors.surface,
            borderColor: colors.border,
            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: layout.largeSectionGap,
            gap: layout.elementGap,
          }}
        >
          <View
            className='flex-row items-center'
            style={{ gap: layout.elementGap }}
          >
            <View
              className='items-center justify-center rounded'
              style={{
                width: layout.avatarSizeSmall,
                height: layout.avatarSizeSmall,
                backgroundColor: `${issue?.avatarColor}`,
              }}
            >
              <AppText
                variant='caption'
                color={colors.white}
                className='font-bold'
              >
                {issue?.avatar}
              </AppText>
            </View>
            <AppText
              variant='body'
              color={colors.textSecondary}
              className='font-medium'
            >
              {issue?.type} • {issue?.id}
            </AppText>
          </View>

          <AppText variant='title' color={colors.text} className='font-bold'>
            {issue?.title}
          </AppText>
          <View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowStatusPicker(!showStatusPicker)}
              className='flex-row items-center self-start rounded-lg border'
              style={{
                backgroundColor: `${colors.primary}1A`,
                borderColor: colors.border,
                paddingHorizontal: layout.paddingHorizontal,
                paddingVertical: layout.elementGap,
                gap: layout.tightGap,
              }}
            >
              <AppText
                variant='body'
                color={colors.info}
                className='font-semibold'
              >
                {status}
              </AppText>
              <Ionicons
                name='chevron-down'
                size={layout.controlSize * 0.8}
                color={colors.info}
              />
            </TouchableOpacity>
            {showStatusPicker && (
              <View
                className='absolute left-0 top-14 border'
                style={{
                  borderRadius: Radius.lg,
                  width: '50%',
                  backgroundColor: colors.card || colors.surface,
                  borderColor: colors.border,
                  paddingHorizontal: layout.paddingHorizontal,
                  paddingVertical: layout.tightGap,
                  shadowColor: colors.black,
                  shadowOpacity: 0.12,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                  zIndex: 999,
                }}
              >
                {statusOptions.map(item => {
                  const isSelected = status === item;
                  const itemColor =
                    statusColors[item as keyof typeof statusColors]?.text ||
                    colors.text;
                  return (
                    <TouchableOpacity
                      key={item}
                      activeOpacity={0.8}
                      onPress={() => {
                        setStatus(item);
                        setShowStatusPicker(false);
                      }}
                      className='flex-row items-center'
                      style={{
                        paddingVertical: layout.elementGap,
                        gap: layout.largeSectionGap,
                      }}
                    >
                      <View
                        className='rounded-full'
                        style={{
                          width: layout.tightGap * 4,
                          height: layout.tightGap * 4,
                          backgroundColor: itemColor,
                        }}
                      />
                      <AppText
                        variant='body'
                        color={isSelected ? colors.info : colors.text}
                        className={isSelected ? 'font-semibold' : 'font-normal'}
                      >
                        {item}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </View>
        <View
          className='mt-3'
          style={{ backgroundColor: colors.card || colors.surface }}
        >
          {details.map(item => (
            <View
              key={item.label}
              className='flex-row items-center justify-between border-b'
              style={{
                borderColor: colors.itemDivider || colors.border,
                paddingHorizontal: layout.paddingHorizontal,
                paddingVertical: isSmallHeight
                  ? layout.largeSectionGap
                  : layout.sectionGap,
              }}
            >
              <AppText variant='body' color={colors.textSecondary}>
                {item.label}
              </AppText>
              {item.initials ? (
                <View
                  className='flex-row items-center'
                  style={{ gap: layout.elementGap }}
                >
                  <Avatar
                    size='medium'
                    initials={item.initials}
                    color={item.color || colors.primary}
                  />
                  <AppText variant='body' color={colors.text}>
                    {item.value}
                  </AppText>
                </View>
              ) : item.dot ? (
                <View
                  className='flex-row items-center'
                  style={{ gap: layout.elementGap }}
                >
                  <View
                    className='rounded-full'
                    style={{
                      width: layout.tightGap * 4,
                      height: layout.tightGap * 4,
                      backgroundColor: item.dot,
                    }}
                  />
                  <AppText variant='body' color={colors.text}>
                    {issue?.priority || item.value}
                  </AppText>
                </View>
              ) : (
                <AppText variant='body' color={colors.text}>
                  {item.value}
                </AppText>
              )}
            </View>
          ))}
        </View>
        <View
          className='mt-3'
          style={{
            backgroundColor: colors.card || colors.surface,
            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: layout.sectionGap,
            gap: layout.sectionGap,
          }}
        >
          <View className='flex-row items-center justify-between'>
            <AppText
              variant='bodyLarge'
              color={colors.text}
              className='font-bold'
            >
              Description
            </AppText>
            <TouchableOpacity onPress={handleOpenEditModal}>
              <Ionicons
                name='pencil-sharp'
                size={layout.iconSize * 0.8}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <AppText variant='body' color={colors.text} className='leading-6'>
            {currentDescription}
          </AppText>
        </View>
        <View
          className='mt-3'
          style={{
            backgroundColor: colors.card || colors.surface,
            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: layout.sectionGap,
          }}
        >
          <View
            className='flex-row items-center justify-between'
            style={{
              paddingVertical: layout.sectionGap,
              backgroundColor: colors.card,
              paddingBottom: layout.paddingBottom,
            }}
          >
            <TouchableOpacity
              className='flex-row items-center'
              style={{
                gap: isSmallHeight
                  ? layout.largeSectionGap + 3
                  : layout.sectionGap - 2,
              }}
              onPress={handleSelectAll}
            >
              <Ionicons
                name={allSelected ? 'checkbox' : 'checkbox-outline'}
                size={layout.iconSize}
                color={allSelected ? colors.success : colors.placeholder}
              />
              <AppText
                variant='body'
                className='font-semibold'
                color={colors.text}
              >
                Child Story
              </AppText>
            </TouchableOpacity>
            <AppText variant='body' color={colors.textSecondary}>
              {completedCount}/{totalCount}
            </AppText>
          </View>
          {subtasks.map(item => {
            const checked =
              subtaskDone[item.id] !== undefined
                ? subtaskDone[item.id]
                : item.done;
            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                className='mb-4 flex-row items-center'
                onPress={() =>
                  setSubtaskDone(prev => ({ ...prev, [item.id]: !checked }))
                }
              >
                <Ionicons
                  name={checked ? 'checkbox' : 'square-outline'}
                  size={layout.iconSize}
                  color={checked ? colors.success : colors.placeholder}
                />
                <AppText
                  variant='body'
                  color={checked ? colors.textSecondary : colors.text}
                  className={`ml-3 flex-1 ${checked ? 'line-through' : ''}`}
                >
                  {item.title}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
        <View
          className='mt-3'
          style={{
            backgroundColor: colors.card || colors.surface,
            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: layout.sectionGap,
          }}
        >
          <View
            className='mb-4 flex-row items-center'
            style={{ gap: layout.elementGap }}
          >
            <Ionicons
              name='attach'
              size={layout.iconSize}
              color={colors.textSecondary}
            />
            <AppText
              variant='bodyLarge'
              color={colors.text}
              className='text-lg font-bold'
            >
              Attachments
            </AppText>
          </View>
          <View className='flex-row' style={{ gap: layout.elementGap }}>
            {['crash_log.txt', 'auth_flow.png'].map(file => (
              <TouchableOpacity
                key={file}
                activeOpacity={0.8}
                className='flex-1 flex-row items-center rounded-lg border'
                style={{
                  backgroundColor: colors.surface || colors.background,
                  borderColor: colors.border,
                  paddingHorizontal: layout.paddingHorizontal,
                  paddingVertical: layout.elementGap,
                  marginBottom: layout.elementGap,
                  gap: layout.elementGap,
                }}
              >
                <Ionicons
                  name='attach'
                  size={layout.iconSize}
                  color={colors.textSecondary}
                />
                <AppText
                  variant='caption'
                  color={colors.text}
                  className='flex-1'
                  numberOfLines={1}
                >
                  {file}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View
          className='mt-3'
          style={{
            backgroundColor: colors.card || colors.surface,
            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: layout.sectionGap,
          }}
        >
          <View
            className='mb-5 flex-row items-center'
            style={{ gap: layout.sectionGap }}
          >
            <Ionicons
              name='chatbox-outline'
              size={layout.iconSize}
              color={colors.textSecondary}
            />
            <AppText
              variant='bodyLarge'
              color={colors.text}
              className='font-bold'
            >
              Activity ({localComments.length})
            </AppText>
          </View>
          {localComments.map(item => (
            <View
              key={item.id}
              style={{ gap: layout.largeSectionGap }}
              className='mb-5 flex-row'
            >
              <Avatar
                size='medium'
                initials={item.avatar}
                color={item.color || colors.primary}
              />
              <View className='flex-1' style={{ gap: layout.tightGap }}>
                <View
                  className='flex-row items-center'
                  style={{ gap: layout.elementGap }}
                >
                  <AppText
                    variant='body'
                    color={colors.text}
                    className='font-bold'
                  >
                    {item.author}
                  </AppText>
                  <AppText variant='caption' color={colors.textSecondary}>
                    {item.time}
                  </AppText>
                </View>
                <AppText
                  variant='body'
                  color={colors.text}
                  className='leading-6'
                >
                  {item.text}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <View
        className='flex-row items-center border-t'
        style={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          borderColor: colors.border,
          gap: layout.largeSectionGap,
          backgroundColor: colors.card,
          paddingBottom: isSmallHeight ? hp(8.75) : hp(2),
        }}
      >
        <Avatar
          size='medium'
          initials='AJ'
          color={colors.avatarBg || colors.warning || colors.primary}
        />
        <View className='flex-1'>
          <AppInput
            value={comment}
            onChangeText={setComment}
            placeholder='Add a comment...'
            style={{
              fontSize: layout.bodyFontSize,
            }}
            rightSendButton={
              <TouchableOpacity
                disabled={!comment.trim()}
                onPress={handleSendComment}
              >
                <AppText
                  variant='body'
                  color={comment.trim() ? colors.primary : colors.secondary}
                  className='font-bold'
                >
                  Send
                </AppText>
              </TouchableOpacity>
            }
          />
        </View>
      </View>
      <PopupModel
        visible={isEditingDescription}
        initialDescription={currentDescription}
        onClose={handleCloseEditModal}
        onSave={handleSaveDescription}
      />
    </Screen>
  );
};

export default IssueDetailScreen;
