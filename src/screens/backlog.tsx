import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme } from '../theme/ThemeProvider';
import { useResponsive } from '../utils/responsive';
import { RootState } from '../store';
import { AppText } from '../components';

const Backlogs = () => {
  const { colors } = useTheme();
  const { moderateScale, fontScale } = useResponsive();

  const columns = useSelector((state: RootState) => state.projectBoard.columns);

  /**
   * Collect all cards from all board columns.
   *
   * Later, this can be replaced with a dedicated
   * backlog Redux state/API.
   */
  const backlogItems = columns.flatMap(column =>
    column.cards.map(card => ({
      ...card,
      columnId: column.id,
      columnTitle: column.title,
    })),
  );

  const renderItem = ({ item }: { item: (typeof backlogItems)[number] }) => {
    return (
      <Pressable
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: moderateScale(10),
            padding: moderateScale(14),
            marginBottom: moderateScale(10),
          },
        ]}
        onPress={() => {
          console.log('Backlog item:', item.id);
        }}
      >
        {/* Title */}
        <View style={styles.titleRow}>
          <AppText
            variant='body'
            style={{
              flex: 1,
              color: colors.text,
              fontSize: fontScale(15),
              fontWeight: '600',
            }}
          >
            {item.title}
          </AppText>

          {/* Status */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: moderateScale(6),
                paddingHorizontal: moderateScale(8),
                paddingVertical: moderateScale(4),
              },
            ]}
          >
            <AppText
              variant='caption'
              style={{
                color: colors.textSecondary,
                fontSize: fontScale(11),
              }}
            >
              {item.columnTitle}
            </AppText>
          </View>
        </View>

        {/* Description */}
        {!!item.description && (
          <AppText
            variant='body'
            numberOfLines={2}
            style={{
              color: colors.textSecondary,
              fontSize: fontScale(13),
              marginTop: moderateScale(8),
            }}
          >
            {item.description}
          </AppText>
        )}

        {/* Bottom Row */}
        <View
          style={[
            styles.bottomRow,
            {
              marginTop: moderateScale(12),
            },
          ]}
        >
          <AppText
            variant='caption'
            style={{
              color: colors.textSecondary,
              fontSize: fontScale(11),
            }}
          >
            Task ID: {item.id}
          </AppText>

          <Pressable
            onPress={() => {
              console.log('Move backlog item:', item.id);
            }}
          >
            <AppText
              variant='caption'
              style={{
                color: colors.primary,
                fontSize: fontScale(12),
                fontWeight: '600',
              }}
            >
              Move to Board
            </AppText>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          padding: moderateScale(16),
        },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            marginBottom: moderateScale(16),
          },
        ]}
      >
        <View style={styles.headerText}>
          <AppText
            variant='title'
            style={{
              color: colors.text,
              fontSize: fontScale(20),
              fontWeight: '700',
            }}
          >
            Backlogs
          </AppText>

          <AppText
            variant='body'
            style={{
              color: colors.textSecondary,
              fontSize: fontScale(13),
              marginTop: moderateScale(4),
            }}
          >
            Manage pending tasks and stories
          </AppText>
        </View>

        {/* Add Backlog */}
        <Pressable
          style={[
            styles.addButton,
            {
              backgroundColor: colors.primary,
              borderRadius: moderateScale(8),
              paddingHorizontal: moderateScale(12),
              paddingVertical: moderateScale(9),
            },
          ]}
          onPress={() => {
            console.log('Add backlog item');
          }}
        >
          <AppText
            variant='body'
            style={{
              color: colors.white,
              fontSize: fontScale(13),
              fontWeight: '600',
            }}
          >
            + Add
          </AppText>
        </Pressable>
      </View>

      {/* Backlog List */}
      <FlatList
        data={backlogItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: moderateScale(24),
          flexGrow: 1,
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <AppText
              variant='body'
              style={{
                color: colors.textSecondary,
                fontSize: fontScale(14),
                textAlign: 'center',
              }}
            >
              No backlog items available
            </AppText>

            <AppText
              variant='caption'
              style={{
                color: colors.placeholder,
                fontSize: fontScale(12),
                textAlign: 'center',
                marginTop: moderateScale(6),
              }}
            >
              Add tasks to start building your backlog.
            </AppText>
          </View>
        }
      />
    </View>
  );
};

export default Backlogs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerText: {
    flex: 1,
  },

  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  card: {
    borderWidth: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  statusBadge: {
    borderWidth: 1,
    marginLeft: 10,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
});
