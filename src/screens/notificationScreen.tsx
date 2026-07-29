import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from '../components/common/AppText';
import Avatar from '../components/Avatar';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { notificationsData, typeIcons } from '../data/notificationsScreenData';

export default function NotificationsScreen() {
  const { colors, strings } = useTheme();
  const { layout } = useAuthLayout();

  const [notifs, setNotifs] = useState(notificationsData);
  const [tab, setTab] = useState<'all' | 'unread'>('all');

  const markAllRead = () =>
    setNotifs((prev: any) => prev.map((n: any) => ({ ...n, read: true })));

  const markRead = (id: number) =>
    setNotifs((prev: any) =>
      prev.map((n: any) => (n.id === id ? { ...n, read: true } : n)),
    );

  const displayed = tab === 'unread' ? notifs.filter(n => !n.read) : notifs;
  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <SafeAreaView
      style={{ backgroundColor: colors.background }}
      className='flex-1'
      edges={['top']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className='flex-1'>
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
            <AppText variant='title' color={colors.text} className='font-bold'>
              {strings.notification.headerTitle}
            </AppText>
            <View
              className='flex-row items-center'
              style={{ gap: layout.elementGap }}
            >
              <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
                <AppText
                  variant='body'
                  color={colors.primary}
                  className='font-semibold'
                >
                  {strings.notification.actionMarkAllRead}
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.7}>
                <Ionicons
                  name='settings-outline'
                  size={layout.iconSize}
                  color={colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* Filter Tabs */}
          <View
            className='flex-row border-b'
            style={{
              backgroundColor: colors.card || colors.surface,
              borderColor: colors.border,
            }}
          >
            {(['all', 'unread'] as const).map(t => {
              const isSelected = tab === t;
              return (
                <TouchableOpacity
                  key={t}
                  activeOpacity={0.8}
                  onPress={() => setTab(t)}
                  className='flex-1 flex-row items-center justify-center'
                  style={{
                    paddingVertical: layout.elementGap,
                    borderBottomWidth: isSelected ? 2 : 0,
                    borderBottomColor: isSelected
                      ? colors.primary
                      : 'transparent',
                    gap: layout.tightGap,
                  }}
                >
                  <AppText
                    variant='body'
                    color={isSelected ? colors.primary : colors.textSecondary}
                    className='font-semibold'
                  >
                    {t === 'unread'
                      ? strings.notification.tabUnread
                      : strings.notification.tabAll}
                  </AppText>
                  {t === 'unread' && unreadCount > 0 && (
                    <View
                      className='items-center justify-center rounded-full'
                      style={{
                        width: layout.controlSize * 0.7,
                        height: layout.controlSize * 0.7,
                        backgroundColor: colors.error,
                      }}
                    >
                      <AppText
                        variant='caption'
                        color={colors.white}
                        className='font-bold'
                      >
                        {unreadCount}
                      </AppText>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          {/* Notifications List or Empty State */}
          {displayed.length > 0 ? (
            <View>
              {displayed.map((n: any) => (
                <TouchableOpacity
                  key={n.id}
                  activeOpacity={0.8}
                  onPress={() => markRead(n.id)}
                  className='w-full flex-row items-start border-b'
                  style={{
                    backgroundColor: n.read
                      ? colors.card || colors.surface
                      : colors.surface || colors.background,
                    borderColor: colors.itemDivider || colors.border,
                    paddingHorizontal: layout.paddingHorizontal,
                    paddingVertical: layout.elementGap,
                    gap: layout.elementGap,
                  }}
                >
                  {/* Unread Indicator Dot */}
                  <View className='pt-2'>
                    <View
                      className='rounded-full'
                      style={{
                        width: layout.tightGap * 1.5,
                        height: layout.tightGap * 1.5,
                        backgroundColor: n.read
                          ? 'transparent'
                          : colors.primary,
                      }}
                    />
                  </View>
                  {/* Avatar & Action Badge */}
                  <View className='relative'>
                    <Avatar
                      size='large'
                      initials={n.avatar}
                      color={n.color || colors.primary}
                    />
                    <View
                      className='absolute -bottom-1 -right-1 items-center justify-center rounded-full border'
                      style={{
                        width: layout.controlSize * 0.75,
                        height: layout.controlSize * 0.75,
                        backgroundColor: colors.card || colors.surface,
                        borderColor: colors.border,
                      }}
                    >
                      <Ionicons
                        name={typeIcons[n.type]?.icon as any}
                        color={colors.text}
                        size={layout.iconSize * 0.6}
                      />
                    </View>
                  </View>

                  {/* Notification Details */}
                  <View className='flex-1'>
                    <AppText
                      variant='body'
                      color={colors.text}
                      className='mb-1 leading-5'
                    >
                      <AppText
                        variant='body'
                        color={colors.text}
                        className='font-semibold'
                      >
                        {n.actor}{' '}
                      </AppText>
                      {n.action}{' '}
                      <AppText
                        variant='body'
                        color={colors.primary}
                        className='font-semibold'
                      >
                        {n.target}
                      </AppText>
                    </AppText>

                    <AppText
                      variant='caption'
                      color={colors.textSecondary}
                      numberOfLines={2}
                      className='leading-4'
                    >
                      {n.preview}
                    </AppText>

                    <AppText
                      variant='caption'
                      color={colors.placeholder || colors.textSecondary}
                      className='mt-1 text-xs'
                    >
                      {n.time}
                    </AppText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            /* Empty State */
            <View
              className='items-center justify-center text-center'
              style={{
                paddingVertical: layout.sectionGap * 3,
                paddingHorizontal: layout.paddingHorizontal,
              }}
            >
              <View
                className='mb-4 items-center justify-center rounded-full'
                style={{
                  width: layout.controlSize * 2,
                  height: layout.controlSize * 2,
                  backgroundColor: colors.surface || colors.border,
                }}
              >
                <Ionicons
                  name='notifications'
                  size={layout.iconSize * 1.5}
                  color={colors.placeholder || colors.textSecondary}
                />
              </View>
              <AppText
                variant='title'
                color={colors.text}
                className='mb-1 font-semibold'
              >
                {strings.notification.emptyTitle}
              </AppText>
              <AppText variant='body' color={colors.textSecondary}>
                {strings.notification.emptySubtitle}
              </AppText>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
