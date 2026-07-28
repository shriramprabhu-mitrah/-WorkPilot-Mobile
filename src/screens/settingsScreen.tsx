import React from 'react';
import { TouchableOpacity, View, ScrollView } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import Screen from '../components/common/ScreenWapper';
import AppText from '../components/common/AppText';
import { ThemeSettingsScreen } from '../theme/ThemeSettingsScreen'; // Ensure path is correct

import { RootStackParamList } from '../types/navigationTypes';
import { useTheme } from '../hooks/useTheme';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { Radius } from '../constants/Radius';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const atlassianSites = [
  { key: 'team.atlassian.net', name: 'Team Alpha', role: 'Admin' },
  { key: 'company.atlassian.net', name: 'Company HQ', role: 'Member' },
];

export default function SettingsScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { colors, strings } = useTheme();
  const { layout, moderateScale, wp } = useAuthLayout();
  const sections: Array<{
    title: string;
    items: Array<{
      iconName: IoniconName;
      label: string;
      path: string;
      color: string;
      isThemeSection?: boolean;
    }>;
  }> = [
    {
      title: strings?.settings?.sections?.account || 'Account',
      items: [
        {
          iconName: 'person-outline',
          label:
            strings?.settings?.sections?.profileVisibility ||
            'Profile & visibility',
          path: 'Account',
          color: colors.primary || '#0052CC',
        },
        {
          iconName: 'shield-checkmark-outline',
          label:
            strings?.settings?.sections?.securityPrivacy ||
            'Security & privacy',
          path: 'Security',
          color: colors.success || '#36B37E',
        },
        {
          iconName: 'globe-outline',
          label:
            strings?.settings?.sections?.languageRegion || 'Language & region',
          path: 'Language',
          color: colors.primary || '#6554C0',
        },
      ],
    },
    {
      title: strings?.settings?.sections?.preferences || 'Preferences',
      items: [
        {
          iconName: 'notifications-outline',
          label: strings?.settings?.sections?.notifications || 'Notifications',
          path: 'Notifications',
          color: '#FFAB00',
        },
        {
          iconName: 'color-palette-outline',
          label: strings?.settings?.sections?.appearance || 'Appearance',
          path: 'Appearance',
          color: colors.error || '#FF5630',
        },
        {
          iconName: 'moon-outline',
          label: strings?.settings?.sections?.theme || 'Theme',
          path: 'Appearance',
          color: colors.primary || '#6554C0',
          isThemeSection: true,
        },
      ],
    },
    {
      title: strings?.settings?.sections?.support || 'Support',
      items: [
        {
          iconName: 'help-circle-outline',
          label: strings?.settings?.sections?.helpCenter || 'Help center',
          path: 'Help',
          color: colors.primary || '#0052CC',
        },
        {
          iconName: 'information-circle-outline',
          label: strings?.settings?.sections?.aboutJira || 'About Jira',
          path: 'About',
          color: colors.textSecondary || '#6B778C',
        },
      ],
    },
  ];

  return (
    <Screen scroll={false} backgroundColor={colors.surface}>
      <View
        className='flex-row items-center border-b'
        style={{
          borderBottomColor: colors.border,
          paddingHorizontal: layout.paddingHorizontal,
          paddingVertical: layout.elementGap,
          gap: wp(3),
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name='arrow-back-outline'
            size={moderateScale(22)}
            color={colors.text}
          />
        </TouchableOpacity>
        <AppText variant='title'>
          {strings?.settings?.headerTitle || 'Settings'}
        </AppText>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: layout.paddingHorizontal,
          paddingTop: layout.paddingTop,
          paddingBottom: layout.paddingBottom,
          backgroundColor: colors.surface,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Account' as any)}
          className='flex-row items-center border'
          style={{
            borderRadius: Radius.md,
            padding: moderateScale(16),
            backgroundColor: colors.background,
            borderColor: colors.border,
            marginBottom: layout.sectionGap,
          }}
        >
          <View
            className='items-center justify-center rounded-full'
            style={{
              width: moderateScale(52),
              height: moderateScale(52),
              backgroundColor: '#FFAB00',
              marginRight: moderateScale(14),
            }}
          >
            <AppText
              style={{
                fontSize: moderateScale(18),
                fontWeight: 'bold',
                color: colors.white || '#FFFFFF',
              }}
            >
              AJ
            </AppText>
          </View>

          <View className='flex-1' style={{ gap: layout.tightGap / 2 }}>
            <AppText variant='bodyLarge' style={{ fontWeight: '600' }}>
              Alex Johnson
            </AppText>
            <AppText variant='caption' color={colors.textSecondary}>
              alex.johnson@company.com
            </AppText>
            <AppText
              variant='caption'
              color={colors.primary}
              style={{ fontWeight: '500', marginTop: moderateScale(2) }}
            >
              {strings?.settings?.manageAccount || 'Manage account →'}
            </AppText>
          </View>
        </TouchableOpacity>
        {sections.map(section => (
          <View
            key={section.title}
            style={{ marginBottom: layout.sectionGap, gap: layout.tightGap }}
          >
            <AppText
              variant='caption'
              color={colors.textSecondary}
              style={{
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: 1,
                marginBottom: layout.tightGap,
                paddingLeft: moderateScale(4),
              }}
            >
              {section.title}
            </AppText>
            <View
              className='rounded-xl border'
              style={{
                borderRadius: Radius.sm,
                paddingHorizontal: layout.paddingHorizontal * 0.5,
                paddingTop: layout.paddingTop,
                paddingBottom: layout.paddingBottom,
                backgroundColor: colors.background || colors.surface,
                borderColor: colors.border,
              }}
            >
              {section.items.map(
                ({ iconName, label, path, color, isThemeSection }, index) => (
                  <View
                    key={label}
                    style={{
                      borderBottomWidth:
                        index !== section.items.length - 1 ? 1 : 0,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <TouchableOpacity
                      disabled={isThemeSection}
                      onPress={() => navigation.navigate(path as any)}
                      activeOpacity={0.6}
                      className='flex-row items-center justify-between'
                      style={{
                        paddingHorizontal: moderateScale(16),
                        paddingVertical: moderateScale(14),
                      }}
                    >
                      <View className='flex-1 flex-row items-center'>
                        <View
                          className='items-center justify-center rounded-lg'
                          style={{
                            width: moderateScale(32),
                            height: moderateScale(32),
                            backgroundColor: `${color}1A`,
                            marginRight: moderateScale(12),
                          }}
                        >
                          <Ionicons
                            name={iconName}
                            size={moderateScale(16)}
                            color={color}
                          />
                        </View>
                        <AppText variant='body' style={{ fontWeight: '500' }}>
                          {label}
                        </AppText>
                      </View>
                      {!isThemeSection && (
                        <Ionicons
                          name='chevron-forward-outline'
                          size={moderateScale(16)}
                          color={colors.placeholder || colors.textSecondary}
                        />
                      )}
                    </TouchableOpacity>
                    {isThemeSection && (
                      <View
                        style={{
                          paddingHorizontal: moderateScale(16),
                          paddingBottom: moderateScale(14),
                        }}
                      >
                        <ThemeSettingsScreen />
                      </View>
                    )}
                  </View>
                ),
              )}
            </View>
          </View>
        ))}
        <View style={{ marginBottom: layout.sectionGap }}>
          <AppText
            variant='caption'
            color={colors.textSecondary}
            style={{
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: layout.tightGap,
              paddingLeft: moderateScale(4),
            }}
          >
            {strings?.settings?.atlassianSites || 'Atlassian sites'}
          </AppText>
          <View
            className='border'
            style={{
              borderRadius: Radius.sm,
              padding: moderateScale(16),
              backgroundColor: colors.background || colors.surface,
              borderColor: colors.border,
            }}
          >
            {atlassianSites.map((site, index) => (
              <View
                key={site.key}
                className='flex-row items-center'
                style={{
                  paddingHorizontal: moderateScale(16),
                  paddingVertical: moderateScale(14),
                  borderBottomWidth:
                    index !== atlassianSites.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <View
                  className='items-center justify-center rounded-lg'
                  style={{
                    width: moderateScale(32),
                    height: moderateScale(32),
                    backgroundColor: colors.primary,
                    marginRight: moderateScale(12),
                  }}
                >
                  <AppText
                    style={{
                      color: colors.white,
                      fontSize: moderateScale(12),
                      fontWeight: 'bold',
                    }}
                  >
                    {site.name[0]}
                  </AppText>
                </View>
                <View className='flex-1'>
                  <AppText variant='body' style={{ fontWeight: '600' }}>
                    {site.name}
                  </AppText>
                  <AppText variant='caption' color={colors.textSecondary}>
                    {site.key}
                  </AppText>
                </View>
                <View
                  style={{
                    borderRadius: Radius.sm,
                    paddingHorizontal: moderateScale(8),
                    paddingVertical: moderateScale(2),
                    backgroundColor:
                      site.role === 'Admin'
                        ? colors.background
                        : colors.surface,
                  }}
                >
                  <AppText
                    variant='caption'
                    style={{
                      fontSize: moderateScale(11),
                      fontWeight: '600',
                      color:
                        site.role === 'Admin'
                          ? colors.primary
                          : colors.textSecondary,
                    }}
                  >
                    {site.role}
                  </AppText>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View
          className='items-center'
          style={{ marginVertical: layout.elementGap }}
        >
          <AppText variant='caption' color={colors.placeholder}>
            {strings?.settings?.versionInfo || 'Jira Cloud · Version 10.14.2'}
          </AppText>
          <AppText variant='caption' color={colors.placeholder}>
            {strings?.settings?.copyright ||
              '© 2026 Atlassian. All rights reserved.'}
          </AppText>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('login' as any)}
          activeOpacity={0.7}
          className='flex-row items-center justify-center border'
          style={{
            borderRadius: Radius.sm,
            backgroundColor: colors.background || colors.surface,
            borderColor: colors.border,
            paddingVertical: moderateScale(12),
            gap: moderateScale(8),
          }}
        >
          <Ionicons
            name='log-out-outline'
            size={moderateScale(18)}
            color={colors.error}
          />
          <AppText
            style={{
              color: colors.error,
              fontWeight: '600',
              fontSize: moderateScale(14),
            }}
          >
            {strings?.settings?.logout || 'Log out'}
          </AppText>
        </TouchableOpacity>
      </ScrollView>
    </Screen>
  );
}
