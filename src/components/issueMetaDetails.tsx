import React, { useState, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import Avatar from './Avatar';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { moderateScale } from '../utils/responsive';
import { ThemeColors } from '../constants/Colors';
import { Radius } from '../constants/Radius';
import {
  getPriorityLabel,
  TaskPriority,
  TASK_PRIORITY_OPTIONS,
  getPriorityThemeColor,
} from '../utils/enum';
import { ProjectMember } from '../types/project.type';

interface DetailItem {
  label: string;
  value: string;
  initials?: string;
  color?: string;
  dot?: string;
  isLoading?: boolean;
}

interface Props {
  details: DetailItem[];
  colors: ThemeColors;
  editableFields?: {
    priority?: boolean;
    storyPoints?: boolean;
    assignee?: boolean;
    reporter?: boolean;
  };
  onPrioritySelect?: (priority: string) => void;
  onAssigneeSelect?: (member: ProjectMember | null) => void;
  onReporterSelect?: (member: ProjectMember | null) => void;
  members?: ProjectMember[];
  membersLoading?: boolean;
  storyPointsInputProps?: {
    value: string;
    onChangeText: (text: string) => void;
    onBlur: () => void;
    editable?: boolean;
  };
}

export const IssueMetaDetails: React.FC<Props> = ({
  details,
  colors,
  editableFields,
  onPrioritySelect,
  onAssigneeSelect,
  onReporterSelect,
  members = [],
  membersLoading = false,
  storyPointsInputProps,
}) => {
  const { layout, isSmallHeight } = useAuthLayout();
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [showReporterDropdown, setShowReporterDropdown] = useState(false);
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState('');
  const [reporterSearchQuery, setReporterSearchQuery] = useState('');

  const CONTROL_WIDTH = moderateScale(140);
  const DROPDOWN_WIDTH = moderateScale(190);

  const togglePriorityDropdown = () => {
    if (!editableFields?.priority) {
      return;
    }
    setShowAssigneeDropdown(false);
    setShowReporterDropdown(false);
    setShowPriorityDropdown(prev => !prev);
  };

  const handlePrioritySelect = (option: TaskPriority) => {
    setShowPriorityDropdown(false);
    onPrioritySelect?.(option);
  };

  const filteredAssigneeMembers = useMemo(() => {
    if (!assigneeSearchQuery.trim()) return members;
    const q = assigneeSearchQuery.toLowerCase();
    return members.filter(
      m =>
        m.full_name?.toLowerCase().includes(q) ||
        m.username?.toLowerCase().includes(q),
    );
  }, [members, assigneeSearchQuery]);

  const filteredReporterMembers = useMemo(() => {
    if (!reporterSearchQuery.trim()) return members;
    const q = reporterSearchQuery.toLowerCase();
    return members.filter(
      m =>
        m.full_name?.toLowerCase().includes(q) ||
        m.username?.toLowerCase().includes(q),
    );
  }, [members, reporterSearchQuery]);

  return (
    <View
      className='mt-3'
      style={{ backgroundColor: colors.card || colors.surface }}
    >
      {details.map(item => {
        const isAssigneeRow = item.label === 'Assignee';
        const isReporterRow = item.label === 'Reporter';
        const isPriorityRow = item.label === 'Priority';
        const isStoryPointsRow = item.label === 'Story pts';

        const isAssigneeEditable = isAssigneeRow && editableFields?.assignee;
        const isReporterEditable = isReporterRow && editableFields?.reporter;
        const isPriorityEditable = isPriorityRow && editableFields?.priority;
        const isStoryPointsEditable =
          isStoryPointsRow && editableFields?.storyPoints;

        const rowZIndex = isAssigneeRow
          ? showAssigneeDropdown
            ? 60
            : 30
          : isReporterRow
            ? showReporterDropdown
              ? 50
              : 20
            : isPriorityRow
              ? showPriorityDropdown
                ? 40
                : 10
              : 1;

        return (
          <View
            key={item.label}
            className='flex-row items-center justify-between border-b'
            style={{
              zIndex: rowZIndex,
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

            {item.isLoading ? (
              <View
                style={{ width: CONTROL_WIDTH }}
                className='items-end justify-center'
              >
                <View
                  className='animate-pulse rounded bg-gray-200 dark:bg-gray-700'
                  style={{ width: 60, height: 16 }}
                />
              </View>
            ) : isAssigneeEditable ? (
              <View
                className='relative z-50 items-end'
                style={{ width: CONTROL_WIDTH }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setShowPriorityDropdown(false);
                    setShowReporterDropdown(false);
                    setShowAssigneeDropdown(prev => !prev);
                  }}
                  className='flex-row items-center justify-between rounded-md border'
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: showAssigneeDropdown
                      ? colors.primary
                      : colors.border,
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                    width: CONTROL_WIDTH,
                  }}
                >
                  <View
                    className='mr-1 flex-1 flex-row items-center'
                    style={{ gap: 6 }}
                  >
                    {item.value !== 'Unassigned' && item.initials ? (
                      <Avatar
                        size='small'
                        initials={item.initials}
                        color={item.color || colors.primary}
                      />
                    ) : (
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: colors.border,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons
                          name='person-outline'
                          size={12}
                          color={colors.textSecondary}
                        />
                      </View>
                    )}
                    <AppText
                      variant='body'
                      color={
                        item.value !== 'Unassigned'
                          ? colors.text
                          : colors.textSecondary
                      }
                      className='text-xs font-semibold'
                      numberOfLines={1}
                      style={{ flex: 1 }}
                    >
                      {item.value}
                    </AppText>
                  </View>
                  <Ionicons
                    name={showAssigneeDropdown ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                {showAssigneeDropdown && (
                  <>
                    <TouchableWithoutFeedback
                      onPress={() => setShowAssigneeDropdown(false)}
                    >
                      <View
                        className='absolute inset-0 z-40'
                        style={{
                          width: 1000,
                          height: 1000,
                          left: -500,
                          top: -500,
                        }}
                      />
                    </TouchableWithoutFeedback>

                    <View
                      className='absolute right-0 z-50 border shadow-lg'
                      style={{
                        top: '100%',
                        marginTop: 4,
                        width: DROPDOWN_WIDTH,
                        borderRadius: Radius.md,
                        backgroundColor: colors.card || colors.surface,
                        borderColor: colors.border,
                        padding: 8,
                        elevation: 8,
                      }}
                    >
                      {/* Search bar inside dropdown */}
                      <View
                        className='mb-2 flex-row items-center rounded-md border px-2'
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.surface,
                          height: 32,
                        }}
                      >
                        <Ionicons
                          name='search-outline'
                          size={14}
                          color={colors.textSecondary}
                        />
                        <TextInput
                          value={assigneeSearchQuery}
                          onChangeText={setAssigneeSearchQuery}
                          placeholder='Search assignee...'
                          placeholderTextColor={colors.textSecondary}
                          style={{
                            flex: 1,
                            padding: 0,
                            marginLeft: 4,
                            color: colors.text,
                            fontSize: 12,
                          }}
                        />
                        {assigneeSearchQuery ? (
                          <TouchableOpacity
                            onPress={() => setAssigneeSearchQuery('')}
                          >
                            <Ionicons
                              name='close-circle'
                              size={14}
                              color={colors.textSecondary}
                            />
                          </TouchableOpacity>
                        ) : null}
                      </View>

                      <ScrollView
                        nestedScrollEnabled
                        keyboardShouldPersistTaps='always'
                        style={{ maxHeight: moderateScale(160) }}
                      >
                        {/* Unassigned Option */}
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => {
                            setShowAssigneeDropdown(false);
                            setAssigneeSearchQuery('');
                            onAssigneeSelect?.(null);
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            paddingVertical: 6,
                            paddingHorizontal: 6,
                            borderRadius: Radius.xs,
                          }}
                        >
                          <View
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 11,
                              backgroundColor: colors.border,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Ionicons
                              name='person-outline'
                              size={12}
                              color={colors.textSecondary}
                            />
                          </View>
                          <AppText
                            variant='body'
                            color={colors.textSecondary}
                            className='text-xs font-medium'
                          >
                            Unassigned
                          </AppText>
                        </TouchableOpacity>

                        {membersLoading ? (
                          <ActivityIndicator
                            size='small'
                            color={colors.primary}
                            style={{ padding: 8 }}
                          />
                        ) : filteredAssigneeMembers.length === 0 ? (
                          <View style={{ padding: 8, alignItems: 'center' }}>
                            <AppText
                              variant='caption'
                              color={colors.textSecondary}
                            >
                              No members found
                            </AppText>
                          </View>
                        ) : (
                          filteredAssigneeMembers.map(m => {
                            const isSelected =
                              item.value === (m.full_name || m.username);
                            const initial = (m.full_name || m.username || 'U')
                              .charAt(0)
                              .toUpperCase();

                            return (
                              <TouchableOpacity
                                key={m.user_id}
                                activeOpacity={0.7}
                                onPress={() => {
                                  setShowAssigneeDropdown(false);
                                  setAssigneeSearchQuery('');
                                  onAssigneeSelect?.(m);
                                }}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  gap: 8,
                                  paddingVertical: 6,
                                  paddingHorizontal: 6,
                                  borderRadius: Radius.xs,
                                  backgroundColor: isSelected
                                    ? `${colors.primary}15`
                                    : 'transparent',
                                }}
                              >
                                {m.avatar_url ? (
                                  <Image
                                    source={{ uri: m.avatar_url }}
                                    style={{
                                      width: 22,
                                      height: 22,
                                      borderRadius: 11,
                                    }}
                                    resizeMode='cover'
                                  />
                                ) : (
                                  <View
                                    style={{
                                      width: 22,
                                      height: 22,
                                      borderRadius: 11,
                                      backgroundColor:
                                        m.color || colors.primary,
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <AppText
                                      variant='caption'
                                      color='#FFF'
                                      style={{
                                        fontSize: 10,
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {initial}
                                    </AppText>
                                  </View>
                                )}
                                <AppText
                                  variant='body'
                                  color={
                                    isSelected ? colors.primary : colors.text
                                  }
                                  className={`text-xs ${
                                    isSelected ? 'font-bold' : 'font-normal'
                                  }`}
                                  numberOfLines={1}
                                  style={{ flex: 1 }}
                                >
                                  {m.full_name || m.username}
                                </AppText>
                              </TouchableOpacity>
                            );
                          })
                        )}
                      </ScrollView>
                    </View>
                  </>
                )}
              </View>
            ) : isReporterEditable ? (
              <View
                className='relative z-50 items-end'
                style={{ width: CONTROL_WIDTH }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setShowPriorityDropdown(false);
                    setShowAssigneeDropdown(false);
                    setShowReporterDropdown(prev => !prev);
                  }}
                  className='flex-row items-center justify-between rounded-md border'
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: showReporterDropdown
                      ? colors.primary
                      : colors.border,
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                    width: CONTROL_WIDTH,
                  }}
                >
                  <View
                    className='mr-1 flex-1 flex-row items-center'
                    style={{ gap: 6 }}
                  >
                    {item.value !== 'N/A' &&
                    item.value !== 'Unassigned' &&
                    item.initials ? (
                      <Avatar
                        size='small'
                        initials={item.initials}
                        color={item.color || colors.secondary}
                      />
                    ) : (
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: colors.border,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons
                          name='person-outline'
                          size={12}
                          color={colors.textSecondary}
                        />
                      </View>
                    )}
                    <AppText
                      variant='body'
                      color={
                        item.value !== 'N/A' && item.value !== 'Unassigned'
                          ? colors.text
                          : colors.textSecondary
                      }
                      className='text-xs font-semibold'
                      numberOfLines={1}
                      style={{ flex: 1 }}
                    >
                      {item.value}
                    </AppText>
                  </View>
                  <Ionicons
                    name={showReporterDropdown ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>

                {showReporterDropdown && (
                  <>
                    <TouchableWithoutFeedback
                      onPress={() => setShowReporterDropdown(false)}
                    >
                      <View
                        className='absolute inset-0 z-40'
                        style={{
                          width: 1000,
                          height: 1000,
                          left: -500,
                          top: -500,
                        }}
                      />
                    </TouchableWithoutFeedback>

                    <View
                      className='absolute right-0 z-50 border shadow-lg'
                      style={{
                        top: '100%',
                        marginTop: 4,
                        width: DROPDOWN_WIDTH,
                        borderRadius: Radius.md,
                        backgroundColor: colors.card || colors.surface,
                        borderColor: colors.border,
                        padding: 8,
                        elevation: 8,
                      }}
                    >
                      {/* Search bar inside dropdown */}
                      <View
                        className='mb-2 flex-row items-center rounded-md border px-2'
                        style={{
                          borderColor: colors.border,
                          backgroundColor: colors.surface,
                          height: 32,
                        }}
                      >
                        <Ionicons
                          name='search-outline'
                          size={14}
                          color={colors.textSecondary}
                        />
                        <TextInput
                          value={reporterSearchQuery}
                          onChangeText={setReporterSearchQuery}
                          placeholder='Search reporter...'
                          placeholderTextColor={colors.textSecondary}
                          style={{
                            flex: 1,
                            padding: 0,
                            marginLeft: 4,
                            color: colors.text,
                            fontSize: 12,
                          }}
                        />
                        {reporterSearchQuery ? (
                          <TouchableOpacity
                            onPress={() => setReporterSearchQuery('')}
                          >
                            <Ionicons
                              name='close-circle'
                              size={14}
                              color={colors.textSecondary}
                            />
                          </TouchableOpacity>
                        ) : null}
                      </View>

                      <ScrollView
                        nestedScrollEnabled
                        keyboardShouldPersistTaps='always'
                        style={{ maxHeight: moderateScale(160) }}
                      >
                        {/* Unassigned / N/A Option */}
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => {
                            setShowReporterDropdown(false);
                            setReporterSearchQuery('');
                            onReporterSelect?.(null);
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            paddingVertical: 6,
                            paddingHorizontal: 6,
                            borderRadius: Radius.xs,
                          }}
                        >
                          <View
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 11,
                              backgroundColor: colors.border,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Ionicons
                              name='person-outline'
                              size={12}
                              color={colors.textSecondary}
                            />
                          </View>
                          <AppText
                            variant='body'
                            color={colors.textSecondary}
                            className='text-xs font-medium'
                          >
                            Unassigned (N/A)
                          </AppText>
                        </TouchableOpacity>

                        {membersLoading ? (
                          <ActivityIndicator
                            size='small'
                            color={colors.primary}
                            style={{ padding: 8 }}
                          />
                        ) : filteredReporterMembers.length === 0 ? (
                          <View style={{ padding: 8, alignItems: 'center' }}>
                            <AppText
                              variant='caption'
                              color={colors.textSecondary}
                            >
                              No members found
                            </AppText>
                          </View>
                        ) : (
                          filteredReporterMembers.map(m => {
                            const isSelected =
                              item.value === (m.full_name || m.username);
                            const initial = (m.full_name || m.username || 'U')
                              .charAt(0)
                              .toUpperCase();

                            return (
                              <TouchableOpacity
                                key={m.user_id}
                                activeOpacity={0.7}
                                onPress={() => {
                                  setShowReporterDropdown(false);
                                  setReporterSearchQuery('');
                                  onReporterSelect?.(m);
                                }}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  gap: 8,
                                  paddingVertical: 6,
                                  paddingHorizontal: 6,
                                  borderRadius: Radius.xs,
                                  backgroundColor: isSelected
                                    ? `${colors.primary}15`
                                    : 'transparent',
                                }}
                              >
                                {m.avatar_url ? (
                                  <Image
                                    source={{ uri: m.avatar_url }}
                                    style={{
                                      width: 22,
                                      height: 22,
                                      borderRadius: 11,
                                    }}
                                    resizeMode='cover'
                                  />
                                ) : (
                                  <View
                                    style={{
                                      width: 22,
                                      height: 22,
                                      borderRadius: 11,
                                      backgroundColor:
                                        m.color || colors.secondary,
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <AppText
                                      variant='caption'
                                      color='#FFF'
                                      style={{
                                        fontSize: 10,
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      {initial}
                                    </AppText>
                                  </View>
                                )}
                                <AppText
                                  variant='body'
                                  color={
                                    isSelected ? colors.primary : colors.text
                                  }
                                  className={`text-xs ${
                                    isSelected ? 'font-bold' : 'font-normal'
                                  }`}
                                  numberOfLines={1}
                                  style={{ flex: 1 }}
                                >
                                  {m.full_name || m.username}
                                </AppText>
                              </TouchableOpacity>
                            );
                          })
                        )}
                      </ScrollView>
                    </View>
                  </>
                )}
              </View>
            ) : isPriorityEditable ? (
              <View
                className='relative z-50 items-end'
                style={{ width: CONTROL_WIDTH }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={togglePriorityDropdown}
                  className='flex-row items-center justify-between rounded-md border'
                  style={{
                    backgroundColor: `${getPriorityThemeColor(
                      item.value.toLowerCase() as TaskPriority,
                      colors,
                    )}1A`,
                    borderColor: colors.border,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    width: CONTROL_WIDTH,
                  }}
                >
                  <View className='flex-row items-center' style={{ gap: 6 }}>
                    <View
                      className='rounded-full'
                      style={{
                        width: 6,
                        height: 6,
                        backgroundColor: getPriorityThemeColor(
                          item.value.toLowerCase() as TaskPriority,
                          colors,
                        ),
                      }}
                    />
                    <AppText
                      variant='body'
                      color={getPriorityThemeColor(
                        item.value.toLowerCase() as TaskPriority,
                        colors,
                      )}
                      className='text-xs font-semibold'
                    >
                      {item.value}
                    </AppText>
                  </View>
                  <Ionicons
                    name={showPriorityDropdown ? 'chevron-up' : 'chevron-down'}
                    size={12}
                    color={getPriorityThemeColor(
                      item.value.toLowerCase() as TaskPriority,
                      colors,
                    )}
                  />
                </TouchableOpacity>

                {showPriorityDropdown && (
                  <>
                    <TouchableWithoutFeedback onPress={togglePriorityDropdown}>
                      <View
                        className='absolute inset-0 z-40'
                        style={{
                          width: 1000,
                          height: 1000,
                          left: -500,
                          top: -500,
                        }}
                      />
                    </TouchableWithoutFeedback>

                    <View
                      className='absolute right-0 z-50 border shadow-md'
                      style={{
                        top: '100%',
                        marginTop: 4,
                        width: CONTROL_WIDTH,
                        borderRadius: Radius.sm,
                        backgroundColor: colors.card || colors.surface,
                        borderColor: colors.border,
                        paddingHorizontal: 8,
                        paddingVertical: 6,
                        gap: 4,
                      }}
                    >
                      {TASK_PRIORITY_OPTIONS.map(option => {
                        const isSelected = item.value.toLowerCase() === option;
                        const optionColor = getPriorityThemeColor(
                          option,
                          colors,
                        );
                        return (
                          <TouchableOpacity
                            key={option}
                            activeOpacity={0.8}
                            onPress={() => handlePrioritySelect(option)}
                            className='flex-row items-center rounded py-1.5 ps-0.5'
                            style={{ gap: 8 }}
                          >
                            <View
                              className='rounded-full'
                              style={{
                                width: 6,
                                height: 6,
                                backgroundColor: optionColor,
                              }}
                            />
                            <AppText
                              variant='body'
                              color={isSelected ? optionColor : colors.text}
                              className={
                                isSelected
                                  ? 'text-xs font-bold'
                                  : 'text-xs font-normal'
                              }
                            >
                              {getPriorityLabel(option)}
                            </AppText>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </>
                )}
              </View>
            ) : isStoryPointsEditable && storyPointsInputProps ? (
              <View
                className='flex-row items-center justify-end'
                style={{ width: CONTROL_WIDTH }}
              >
                <TextInput
                  value={storyPointsInputProps.value}
                  onChangeText={storyPointsInputProps.onChangeText}
                  onBlur={storyPointsInputProps.onBlur}
                  editable={storyPointsInputProps.editable ?? true}
                  keyboardType='numeric'
                  textAlign='center'
                  maxLength={3}
                  style={{
                    width: CONTROL_WIDTH,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                    borderRadius: Radius.sm,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    color: colors.text,
                    fontSize: layout.bodyFontSize * 0.9,
                  }}
                />
              </View>
            ) : item.initials ? (
              <View
                className='flex-row items-center'
                style={{ width: CONTROL_WIDTH, gap: layout.elementGap }}
              >
                <Avatar
                  size='small'
                  initials={item.initials}
                  color={item.color || colors.primary}
                />
                <AppText variant='body' color={colors.text} numberOfLines={1}>
                  {item.value}
                </AppText>
              </View>
            ) : item.dot ? (
              <View
                className='flex-row items-center'
                style={{ width: CONTROL_WIDTH, gap: layout.elementGap }}
              >
                <Ionicons name='flag' size={14} color={item.dot} />
                <AppText variant='body' color={colors.text}>
                  {item.value}
                </AppText>
              </View>
            ) : (
              <View style={{ width: CONTROL_WIDTH, alignItems: 'flex-end' }}>
                <AppText variant='body' color={colors.text}>
                  {item.value}
                </AppText>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};
