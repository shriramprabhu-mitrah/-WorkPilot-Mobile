import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import Screen from '../components/common/ScreenWapper';
import CommonHeader from '../components/common/CommonHeader';
import AppText from '../components/common/AppText';
import PopupModel from '../components/Model';
import { useIssueDetails } from '../hooks/useIssueDetails';

// Subcomponents
import { IssueHeaderSection } from '../components/issueHeaderSection';
import { IssueMetaDetails } from '../components/issueMetaDetails';
import { IssueDescriptionSection } from '../components/issueDescriptionSection';
import { IssueChildTasksSection } from '../components/issueChildTasksSection';
import { IssueCommentsSection } from '../components/issueCommentsSection';
import { IssueCommentInput } from '../components/issueCommentInput';
import IssueDetailSkeleton from '../components/skeleton/issueDetailSkeleton';

const IssueDetailScreen = () => {
  const hooks = useIssueDetails();
  const { colors, loading, currentItem, navigation } = hooks;

  if (loading) {
    return <IssueDetailSkeleton />;
  }

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <CommonHeader
        variant='custom'
        title={currentItem?.title}
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <AppText
            variant='caption'
            color={colors.textSecondary}
            className='text-xs font-semibold'
            numberOfLines={1}
          >
            {currentItem?.formatted_serial_number}
          </AppText>
        }
      />

      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        <IssueHeaderSection hooks={hooks} />
        <IssueMetaDetails details={hooks.details} colors={colors} />
        <IssueDescriptionSection
          description={hooks.currentDescription}
          colors={colors}
          onEdit={hooks.handleOpenEditModal}
        />
        {!hooks.isTaskView && (
          <IssueChildTasksSection
            subtasks={hooks.subtasks}
            colors={colors}
            projectId={hooks.projectId}
            navigation={navigation}
          />
        )}
        <IssueCommentsSection hooks={hooks} />
      </ScrollView>

      <IssueCommentInput hooks={hooks} />

      <PopupModel
        visible={hooks.isEditingDescription}
        initialDescription={hooks.currentDescription}
        onClose={hooks.handleCloseEditModal}
        onSave={hooks.handleSaveDescription}
      />
    </Screen>
  );
};

export default IssueDetailScreen;
