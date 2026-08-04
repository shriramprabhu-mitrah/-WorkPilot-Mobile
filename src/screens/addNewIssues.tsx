import React, { useState } from 'react';
import {
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import ImagePicker from 'react-native-image-crop-picker';
import {
  pick,
  types,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';
import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import OptionButton from '../components/common/Button/OptionButton';
import PriorityButton from '../components/common/Button/PriorityButton';
import NumberButton from '../components/common/Button/NumberButton';
import AssigneeButton from '../components/common/Button/AssigneButton';
import { AttachmentMenu } from '../components/Attachments/AttachmentMenu';
import { AttachmentList } from '../components/Attachments/AttachmentList';
import { AttachmentFile } from '../data/addNewIssuesData';
import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import {
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
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const { layout, moderateScale, isSmallHeight, hp } = useAuthLayout();

  const handleCreate = () => {
    navigation.navigate('projectDetails', { id: project });
  };

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

  // 1. Gallery Pick (Photo or Video)
  const handleChoosePhotoOrVideo = async () => {
    try {
      const media = await ImagePicker.openPicker({
        mediaType: 'any',
        cropping: false,
      });

      const isVideo = media.mime?.startsWith('video');

      const newFile: AttachmentFile = {
        id: `${Date.now()}`,
        uri: media.path,
        name: media.filename || `${isVideo ? 'video' : 'photo'}_${Date.now()}`,
        type: isVideo ? 'video' : 'image',
        size: media.size,
      };

      setAttachments(prev => [...prev, newFile]);
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', error?.message || 'Failed to pick media');
      }
    }
  };

  // 2. Camera - Take Photo with Cropping
  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera access required.');
      return;
    }

    try {
      const image = await ImagePicker.openCamera({
        mediaType: 'photo',
        cropping: true,
        freeStyleCropEnabled: true,
        compressImageQuality: 0.8,
      });

      const newFile: AttachmentFile = {
        id: `${Date.now()}`,
        uri: image.path,
        name: `photo_${Date.now()}.jpg`,
        type: 'image',
        size: image.size,
      };

      setAttachments(prev => [...prev, newFile]);
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', error?.message || 'Failed to capture photo');
      }
    }
  };

  // 3. Camera - Record Video Directly
  const handleRecordVideo = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera access required.');
      return;
    }

    try {
      const video = await ImagePicker.openCamera({
        mediaType: 'video',
      });

      const newFile: AttachmentFile = {
        id: `${Date.now()}`,
        uri: video.path,
        name: `video_${Date.now()}.mp4`,
        type: 'video',
        size: video.size,
      };

      setAttachments(prev => [...prev, newFile]);
    } catch (error: any) {
      if (error?.code !== 'E_PICKER_CANCELLED') {
        Alert.alert('Error', error?.message || 'Failed to record video');
      }
    }
  };

  // 4. File Picker
  const handleChooseFile = async () => {
    try {
      const res = await pick({
        type: [types.allFiles],
        allowMultiSelection: true,
      });

      const newFiles: AttachmentFile[] = res.map((doc, index) => ({
        id: `${Date.now()}-${index}`,
        uri: doc.uri,
        name: doc.name || 'Document',
        type: 'file',
        size: doc.size ?? undefined,
      }));

      setAttachments(prev => [...prev, ...newFiles]);
    } catch (err) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      Alert.alert('Error', 'Unable to pick document');
    }
  };

  // 5. Document Scanner
  // const handleScanDocuments = async () => {
  //   const hasPermission = await requestCameraPermission();
  //   if (!hasPermission) {
  //     Alert.alert('Permission Denied', 'Camera access required.');
  //     return;
  //   }

  //   try {
  //     const document = await ImagePicker.openCamera({
  //       cropping: true,
  //       freeStyleCropEnabled: true,
  //       showCropGuidelines: true,
  //       cropperToolbarTitle: 'Scan & Crop Document',
  //       compressImageQuality: 0.9,
  //     });

  //     const newFile: AttachmentFile = {
  //       id: `${Date.now()}`,
  //       uri: document.path,
  //       name: `scanned_doc_${Date.now()}.jpg`,
  //       type: 'document',
  //       size: document.size,
  //     };

  //     setAttachments(prev => [...prev, newFile]);
  //   } catch (error: any) {
  //     if (error?.code !== 'E_PICKER_CANCELLED') {
  //       Alert.alert('Error', error?.message || 'Failed to scan document');
  //     }
  //   }
  // };

  // Switch handler for all attachment menu options
  const handleSelectOption = (optionId: string) => {
    switch (optionId) {
      case '1':
        handleChoosePhotoOrVideo();
        break;
      case '2':
        handleTakePhoto();
        break;
      case '3':
        handleRecordVideo();
        break;
      case '4':
        handleChooseFile();
        break;
      default:
        break;
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(item => item.id !== id));
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
          paddingTop: layout.paddingTop,
          paddingBottom: isSmallHeight ? hp(20) : hp(12),
          gap: isSmallHeight ? layout.largeSectionGap : layout.elementGap,
        }}
      >
        <View style={{ gap: layout.elementGap }}>
          <AppText
            variant='bodyLarge'
            color={colors.text}
            className='font-bold'
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
            contentContainerStyle={{
              gap: isSmallHeight ? layout.sectionGap : layout.elementGap - 2.5,
            }}
          />
        </View>
        <View style={{ gap: layout.elementGap }}>
          <AppText
            variant='bodyLarge'
            color={colors.text}
            className='font-bold'
          >
            {strings.createIssue?.issueTypeLabel || 'Issue type'}
          </AppText>
          <View
            className='flex-row flex-wrap'
            style={{
              gap: isSmallHeight ? layout.sectionGap : layout.elementGap - 2.5,
            }}
          >
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
        </View>
        <View style={{ gap: layout?.elementGap }}>
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
        <View style={{ gap: layout.elementGap }}>
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
        <View style={{ gap: layout.elementGap }}>
          <AppText
            variant='bodyLarge'
            color={colors.text}
            className='font-bold'
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
        </View>
        <View style={{ gap: layout.elementGap }}>
          <AppText
            variant='bodyLarge'
            color={colors.text}
            className='font-bold'
          >
            {strings.createIssue?.assigneeLabel || 'Assignee'}
          </AppText>
          <View
            style={{
              gap: isSmallHeight ? layout.sectionGap : layout.elementGap - 2.5,
            }}
            className='flex-row flex-wrap'
          >
            {assignees.map((item: string) => (
              <AssigneeButton
                key={item}
                title={item}
                selected={assignee === item}
                onPress={() => setAssignee(item)}
              />
            ))}
          </View>
        </View>
        <View style={{ gap: layout.elementGap }}>
          <AppText
            variant='bodyLarge'
            color={colors.text}
            className='font-bold'
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
        </View>

        {/* ATTACHMENT SECTION */}
        <View style={{ gap: layout.elementGap }}>
          <AttachmentMenu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            onSelectOption={handleSelectOption}
            anchor={
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setMenuVisible(true)}
                className='flex-row items-center'
                style={{ gap: layout.elementGap }}
              >
                <Ionicons
                  name='image-outline'
                  size={20}
                  color={colors.primary}
                />
                <AppText
                  variant='bodyLarge'
                  color={colors.primary}
                  className='font-bold'
                >
                  {strings.createIssue?.addAttachment || 'Add attachment'}
                </AppText>
              </TouchableOpacity>
            }
          />
          <AttachmentList
            attachments={attachments}
            onRemoveAttachment={handleRemoveAttachment}
            colors={colors}
            layout={layout}
          />
        </View>
      </ScrollView>
    </Screen>
  );
};

export default AddNewIssues;
