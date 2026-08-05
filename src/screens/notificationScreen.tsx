import React, { useState } from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from '../components/common/AppText';
import Avatar from '../components/Avatar';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import {
  NotificationDataType,
  getNotificationsData,
  typeIcons,
} from '../data/notificationsScreenData';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigationTypes';
import { useNavigation } from '@react-navigation/native';
import Screen from '../components/common/ScreenWapper';

export default function NotificationsScreen() {
  const { colors, strings } = useTheme();
  const { layout, isSmallHeight, hp } = useAuthLayout();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [notifs, setNotifs] = useState<NotificationDataType[]>(
    getNotificationsData(colors),
  );
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const markAllRead = () =>
    setNotifs((prev: NotificationDataType[]) =>
      prev.map((n: NotificationDataType) => ({ ...n, read: true })),
    );
  const markRead = (id: number) =>
    setNotifs((prev: NotificationDataType[]) =>
      prev.map((n: NotificationDataType) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    );
  const displayed =
    tab === 'unread'
      ? notifs.filter((n: NotificationDataType) => !n.read)
      : notifs;
  const unreadCount = notifs.filter(
    (n: NotificationDataType) => !n.read,
  ).length;
  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
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
          style={{ gap: layout.largeSectionGap }}
        >
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
              <AppText
                variant='body'
                color={colors.primary}
                className='font-semibold'
              >
                {strings.notification.actionMarkAllRead}
              </AppText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Ionicons
              name='settings-outline'
              size={layout.iconSize}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View
        className='flex-row'
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
                borderBottomWidth: 2,
                borderBottomColor: isSelected ? colors.primary : 'transparent',
                gap: layout.tightGap,
              }}
            >
              <AppText
                variant='body'
                color={isSelected ? colors.primary : colors.textSecondary}
                className='font-bold'
              >
                {t === 'unread'
                  ? strings.notification.tabUnread
                  : strings.notification.tabAll}
              </AppText>
              {t === 'unread' && unreadCount > 0 && (
                <View
                  className='items-center justify-center rounded-full'
                  style={{
                    width: layout.controlSize,
                    height: layout.controlSize,
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
      {displayed.length > 0 ? (
        <FlatList
          data={displayed}
          keyExtractor={(item: NotificationDataType) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={{
            paddingBottom: isSmallHeight ? hp(20) : hp(12),
            flexGrow: 1,
          }}
          renderItem={({ item }: { item: NotificationDataType }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                markRead(item.id);
                navigation.navigate('issue', { id: item.target });
              }}
              className='flex-row items-start'
              style={{
                backgroundColor: item.read
                  ? colors.card || colors.surface
                  : `${colors.secondary}2A` || colors.background,
                borderBottomWidth: 2,
                borderBottomColor: colors.itemDivider || colors.border,
                paddingHorizontal: layout.paddingHorizontal,
                paddingVertical: layout.largeSectionGap,
                gap: layout.largeSectionGap,
              }}
            >
              <View
                className='flex-row items-center'
                style={{ gap: layout.elementGap }}
              >
                <View
                  className='rounded-full'
                  style={{
                    width: layout.controlSize * 0.3,
                    height: layout.controlSize * 0.3,
                    backgroundColor: item.read ? 'transparent' : colors.primary,
                  }}
                />
                <View className='relative'>
                  <Avatar
                    size='large'
                    initials={item.avatar}
                    color={item.color || colors.primary}
                  />
                  <View
                    className='absolute -bottom-1 -right-1 items-center justify-center rounded-full border shadow'
                    style={{
                      width: layout.controlSize,
                      height: layout.controlSize,
                      backgroundColor: colors.card || colors.surface,
                      borderColor: colors.border,
                    }}
                  >
                    <Ionicons
                      name={typeIcons[item.type].icon}
                      color={colors.text}
                      size={layout.iconSize * 0.6}
                    />
                  </View>
                </View>
              </View>
              <View className='flex-1' style={{ gap: layout.tightGap }}>
                <AppText
                  variant='body'
                  color={colors.text}
                  className='font-semibold leading-6'
                  numberOfLines={2}
                >
                  <AppText
                    variant='body'
                    color={colors.text}
                    className='font-bold'
                  >
                    {item.actor}{' '}
                  </AppText>
                  {item.action}{' '}
                  <AppText
                    variant='body'
                    color={colors.primary}
                    className='font-semibold'
                  >
                    {item.target}
                  </AppText>
                </AppText>
                <AppText
                  variant='caption'
                  color={colors.textSecondary}
                  numberOfLines={1}
                  ellipsizeMode='clip'
                  className='leading-4'
                >
                  {item.preview}
                </AppText>
                <AppText
                  variant='caption'
                  color={colors.placeholder || colors.textSecondary}
                >
                  {item.time}
                </AppText>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View className='flex-1 items-center justify-center'>
          <View
            className='items-center justify-center text-center'
            style={{
              paddingVertical: layout.sectionGap * 3,
              paddingHorizontal: layout.paddingHorizontal,
              gap: layout.elementGap,
            }}
          >
            <View
              className='items-center justify-center rounded-full'
              style={{
                width: layout.controlSize * 2,
                height: layout.controlSize * 2,
                backgroundColor: colors.surface,
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
        </View>
      )}
    </Screen>
  );
}
