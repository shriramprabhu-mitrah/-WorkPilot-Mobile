import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import Screen from '../common/ScreenWapper';
import CommonHeader from '../common/CommonHeader';
import { TouchableOpacity } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from '../common/AppText';

const ROLE_COUNT = 5;
const PERMISSION_GROUP_COUNT = 5;
const ACTION_COUNT = 4;

const RolePermissionSkeleton = () => {
  const { colors } = useTheme();

  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  const SkeletonBox = ({
    width,
    height,
    borderRadius = 8,
  }: {
    width: number | string;
    height: number;
    borderRadius?: number;
  }) => (
    <Animated.View
      style={{
        width: width as number,
        height: height,
        borderRadius,
        backgroundColor: colors.border,
        opacity,
      }}
    />
  );

  const RoleCardSkeleton = () => (
    <View
      style={{
        width: 78,
        height: 78,
        borderRadius: 16,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SkeletonBox width={22} height={22} borderRadius={11} />

      <View style={{ height: 7 }} />

      <SkeletonBox width={48} height={9} borderRadius={4} />

      <View style={{ height: 4 }} />

      <SkeletonBox width={38} height={9} borderRadius={4} />
    </View>
  );

  const ActiveRoleSkeleton = () => (
    <View
      style={{
        marginBottom: 16,
        minHeight: 82,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          paddingRight: 12,
        }}
      >
        <SkeletonBox width={44} height={44} borderRadius={12} />

        <View style={{ marginLeft: 12, flex: 1 }}>
          <SkeletonBox width={120} height={16} borderRadius={6} />

          <View style={{ height: 8 }} />

          <SkeletonBox width={85} height={12} borderRadius={5} />
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: 8,
        }}
      >
        <SkeletonBox width={36} height={36} borderRadius={18} />

        <SkeletonBox width={36} height={36} borderRadius={18} />
      </View>
    </View>
  );

  const PermissionGroupSkeleton = ({
    expanded = false,
  }: {
    expanded?: boolean;
  }) => (
    <View
      style={{
        overflow: 'hidden',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        marginBottom: 12,
      }}
    >
      {/* Header */}
      <View
        style={{
          minHeight: 60,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <SkeletonBox width={20} height={20} borderRadius={5} />

          <SkeletonBox width={90} height={15} borderRadius={5} />
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <SkeletonBox width={36} height={20} borderRadius={10} />

          <SkeletonBox width={18} height={18} borderRadius={9} />
        </View>
      </View>

      {/* Keep only the first group expanded because your actual
          initial expandedSections is { projects: true } */}
      {expanded && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingHorizontal: 16,
          }}
        >
          {Array.from({ length: ACTION_COUNT }).map((_, index) => (
            <View
              key={index}
              style={{
                minHeight: 64,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottomWidth: index === ACTION_COUNT - 1 ? 0 : 1,
                borderBottomColor: colors.border,
              }}
            >
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingRight: 12,
                }}
              >
                <SkeletonBox width={18} height={18} borderRadius={5} />

                <View
                  style={{
                    flex: 1,
                    marginLeft: 12,
                  }}
                >
                  <SkeletonBox width={65} height={14} borderRadius={5} />

                  <View style={{ height: 6 }} />

                  <SkeletonBox width={125} height={11} borderRadius={4} />
                </View>
              </View>

              <SkeletonBox width={42} height={24} borderRadius={12} />
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <Screen backgroundColor={colors.surface}>
      {/* Keep the real header so there is no header jump */}
      <CommonHeader
        variant='organizationMembers'
        title='Permissions'
        titleAlignment='left'
        onBackPress={() => {}}
        searchQuery=''
        onChangeSearchQuery={() => {}}
        searchPlaceholder='Search roles...'
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        className='px-4 pt-3'
      >
        {/* Role selector */}
        <View
          style={{
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: 8,
              paddingRight: 8,
            }}
          >
            {Array.from({ length: ROLE_COUNT }).map((_, index) => (
              <RoleCardSkeleton key={index} />
            ))}
          </ScrollView>

          {/* Fixed New Role space */}
          <TouchableOpacity
            activeOpacity={0.8}
            className='ml-1 items-center justify-center rounded-2xl border px-3 py-2.5'
            style={{
              width: 78,
              height: 78,
              borderStyle: 'dashed',
              borderColor: colors.primary,
              backgroundColor: colors.card,
            }}
          >
            <Ionicons name='add' size={24} color={colors.primary} />
            <AppText
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: colors.primary,
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              New Role
            </AppText>
          </TouchableOpacity>
        </View>

        {/* Active role */}
        <ActiveRoleSkeleton />

        {/* Permission groups */}
        <View>
          {Array.from({
            length: PERMISSION_GROUP_COUNT,
          }).map((_, index) => (
            <PermissionGroupSkeleton key={index} expanded={index === 0} />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
};

export default RolePermissionSkeleton;
