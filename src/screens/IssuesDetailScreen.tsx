import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AppText from '../components/common/AppText';
import Avatar from '../components/Avatar';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { RootStackParamList } from '../types/navigationTypes';
import {
  getComments,
  getDetails,
  subtasks,
  statusOptions,
  getStatusColors,
  myIssues,
} from '../data/issuesDetailsScreenData';

const IssueDetailScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const issueId = route.params?.id;
  const { colors } = useTheme();
  const { layout } = useAuthLayout();

  // Memoize dynamic getter values based on current theme colors
  const comments = useMemo(() => getComments(colors), [colors]);
  const details = useMemo(() => getDetails(colors), [colors]);
  const statusColors = useMemo(() => getStatusColors(colors), [colors]);
  const [comment, setComment] = useState<string>('');
  const [status, setStatus] = useState('In Progress');
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [subtaskDone, setSubtaskDone] = useState<Record<string, boolean>>({
    'CLOUD-330a': true,
  });
  const issue = myIssues.find(item => item.id === issueId);
  const [localComments, setLocalComments] = useState(comments);

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
    setLocalComments(prev => [...prev, newComment]);
    setComment('');
  };

  const currentStatusColor = statusColors[
    status as keyof typeof statusColors
  ] || {
    bg: colors.surface || colors.background,
    text: colors.text,
  };

  return (
    <SafeAreaView
      style={{ backgroundColor: colors.background }}
      className='flex-1'
      edges={['top']}
    >
      {/* Header */}
      <View
        className='flex-row items-center justify-between border-b'
        style={{
          backgroundColor: colors.card || colors.surface,
          borderColor: colors.border,
          paddingHorizontal: layout.paddingHorizontal,
          paddingVertical: layout.elementGap,
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
          style={{ gap: layout.elementGap }}
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
        {/* Issue Overview & Title */}
        <View
          className='border-b'
          style={{
            backgroundColor: colors.card || colors.surface,
            borderColor: colors.border,
            paddingHorizontal: layout.paddingHorizontal,
            paddingTop: layout.elementGap,
            paddingBottom: layout.sectionGap,
          }}
        >
          <View className='mb-3 flex-row items-center'>
            <View
              className='items-center justify-center rounded'
              style={{
                width: layout.avatarSizeSmall,
                height: layout.avatarSizeSmall,
                backgroundColor: colors.error,
              }}
            >
              <AppText
                variant='caption'
                color={colors.white}
                className='font-bold'
              >
                B
              </AppText>
            </View>
            <AppText
              variant='body'
              color={colors.textSecondary}
              className='ml-2 font-medium'
            >
              {issue?.type} • {issue?.id}
            </AppText>
          </View>

          <AppText
            variant='title'
            color={colors.text}
            className='mb-4 font-bold'
          >
            {issue?.title}
          </AppText>

          {/* Status Dropdown Picker */}
          <View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowStatusPicker(!showStatusPicker)}
              className='flex-row items-center self-start rounded-lg border'
              style={{
                backgroundColor: currentStatusColor.bg,
                borderColor: colors.border,
                paddingHorizontal: layout.paddingHorizontal,
                paddingVertical: layout.tightGap * 2,
                gap: layout.tightGap,
              }}
            >
              <AppText
                variant='body'
                color={currentStatusColor.text}
                className='font-semibold'
              >
                {issue?.status || status}
              </AppText>
              <Ionicons
                name='chevron-down'
                size={layout.controlSize * 0.8}
                color={currentStatusColor.text}
              />
            </TouchableOpacity>

            {showStatusPicker && (
              <View
                className='absolute left-0 top-14 rounded-xl border'
                style={{
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
                      className='flex-row items-center py-3'
                    >
                      <View
                        className='mr-3 rounded-full'
                        style={{
                          width: layout.tightGap * 2.5,
                          height: layout.tightGap * 2.5,
                          backgroundColor: itemColor,
                        }}
                      />
                      <AppText
                        variant='body'
                        color={isSelected ? colors.primary : colors.text}
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
        {/* Issue Details List */}
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
                paddingVertical: layout.elementGap,
              }}
            >
              <AppText
                variant='body'
                color={colors.textSecondary}
                className='w-28'
              >
                {item.label}
              </AppText>
              {item.initials ? (
                <View className='flex-row items-center'>
                  <Avatar
                    size='small'
                    initials={item.initials}
                    color={item.color || colors.primary}
                  />
                  <AppText variant='body' color={colors.text} className='ml-2'>
                    {item.value}
                  </AppText>
                </View>
              ) : item.dot ? (
                <View
                  className='flex-row items-center'
                  style={{ gap: layout.tightGap }}
                >
                  <View
                    className='rounded-full'
                    style={{
                      width: layout.tightGap * 2.5,
                      height: layout.tightGap * 2.5,
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
        {/* Description Section */}
        <View
          className='mt-3'
          style={{
            backgroundColor: colors.card || colors.surface,
            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: layout.sectionGap,
          }}
        >
          <View className='mb-3 flex-row items-center justify-between'>
            <AppText
              variant='title'
              color={colors.text}
              className='text-lg font-semibold'
            >
              Description
            </AppText>
            <TouchableOpacity>
              <Ionicons
                name='create-outline'
                size={layout.iconSize * 0.8}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <AppText variant='body' color={colors.text} className='leading-6'>
            iOS clients using the Jira API are experiencing intermittent
            authentication failures after token expiry. The refresh token
            mechanism is not triggering correctly, causing users to be logged
            out unexpectedly.
          </AppText>
          <AppText
            variant='body'
            color={colors.text}
            className='mt-4 leading-6'
          >
            <AppText variant='body' color={colors.text} className='font-bold'>
              Steps to reproduce :{' '}
            </AppText>
            Login on iOS → Wait 15 minutes → Perform any API request → A 401
            Unauthorized error appears despite a valid refresh token.
          </AppText>
        </View>
        {/* Comment Input & Subtasks */}
        <View
          className='mt-3'
          style={{
            backgroundColor: colors.card || colors.surface,
            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: layout.sectionGap,
          }}
        >
          {/* Add Comment Field */}
          <View
            className='flex-row items-center border-t py-4 pb-6'
            style={{ borderColor: colors.border, gap: layout.elementGap }}
          >
            <Avatar
              size='medium'
              initials='AJ'
              color={colors.avatarBg || colors.warning || colors.primary}
            />
            <View
              className='flex-1 flex-row items-end rounded-xl'
              style={{
                backgroundColor: colors.surface || colors.background,
                paddingHorizontal: layout.paddingHorizontal,
              }}
            >
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder='Add a comment...'
                multiline
                className='flex-1'
                style={{
                  color: colors.text,
                  fontSize: layout.bodyFontSize,
                }}
                placeholderTextColor={colors.placeholder}
              />
              <TouchableOpacity
                disabled={!comment.trim()}
                onPress={handleSendComment}
              >
                <AppText
                  variant='body'
                  color={comment.trim() ? colors.primary : colors.placeholder}
                  className='mb-3 font-semibold'
                >
                  Send
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
          {/* Subtasks Checklist */}
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
        {/* Attachments Section */}
        <View
          className='mt-3'
          style={{
            backgroundColor: colors.card || colors.surface,
            paddingHorizontal: layout.paddingHorizontal,
            paddingVertical: layout.sectionGap,
          }}
        >
          <View className='mb-4 flex-row items-center'>
            <Ionicons
              name='attach'
              size={layout.iconSize * 0.8}
              color={colors.textSecondary}
            />
            <AppText
              variant='title'
              color={colors.text}
              className='ml-2 text-lg font-semibold'
            >
              Attachments
            </AppText>
          </View>
          <View className='flex-row' style={{ gap: layout.elementGap }}>
            {['crash_log.txt', 'auth_flow.png'].map(file => (
              <TouchableOpacity
                key={file}
                activeOpacity={0.8}
                className='flex-1 flex-row items-center rounded-xl border'
                style={{
                  backgroundColor: colors.surface || colors.background,
                  borderColor: colors.border,
                  paddingHorizontal: layout.paddingHorizontal / 1.5,
                  paddingVertical: layout.elementGap,
                  marginBottom: layout.elementGap,
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
                  className='ml-3 flex-1'
                  numberOfLines={1}
                >
                  {file}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Activity / Comments List */}
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
            style={{ gap: layout.tightGap }}
          >
            <Ionicons
              name='chatbox-outline'
              size={layout.iconSize * 0.8}
              color={colors.textSecondary}
            />
            <AppText
              variant='title'
              color={colors.text}
              className='text-lg font-semibold'
            >
              Activity ({localComments.length})
            </AppText>
          </View>
          {localComments.map(item => (
            <View key={item.id} className='mb-5 flex-row'>
              <Avatar
                size='medium'
                initials={item.avatar}
                color={item.color || colors.primary}
              />
              <View className='ml-3 flex-1'>
                <View className='flex-row items-center'>
                  <AppText
                    variant='body'
                    color={colors.text}
                    className='font-semibold'
                  >
                    {item.author}
                  </AppText>
                  <AppText
                    variant='caption'
                    color={colors.textSecondary}
                    className='ml-2'
                  >
                    {item.time}
                  </AppText>
                </View>
                <AppText
                  variant='body'
                  color={colors.text}
                  className='mt-1 leading-6'
                >
                  {item.text}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default IssueDetailScreen;
