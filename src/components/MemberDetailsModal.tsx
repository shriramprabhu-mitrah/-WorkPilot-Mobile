import React, { useEffect, useMemo, useState } from 'react';
import {
  Clipboard,
  Dimensions,
  Modal,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from './common/AppText';
import { useAuthLayout } from '../hooks/useAuthLayout';
import { useTheme } from '../hooks/useTheme';
import { CustomSnackbar, type SnackbarType } from './common/Snackbar';
import { Radius } from '../constants/Radius';
import Avatar from './Avatar';

export interface MemberDetailsData {
  name?: string | null;
  full_name?: string | null;
  username?: string | null;
  user_name?: string | null;
  email?: string | null;
  role?: string | null;
  color?: string | null;
  avatar_url?: string | null;
  organization_name?: string | null;
}

interface Props {
  visible: boolean;
  member: MemberDetailsData | null;
  onClose: () => void;
  origin?: { x: number; y: number; size: number } | null;
}

const valueOrEmpty = (value?: string | null) => value?.trim() || '';

const formatRoleBadge = (role: string) =>
  role
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

const MemberDetailsModal = ({ visible, member, onClose, origin }: Props) => {
  const { colors } = useTheme();
  const { moderateScale } = useAuthLayout();
  const progress = useSharedValue(0);
  const backdropProgress = useSharedValue(0);
  const [closing, setClosing] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    type: SnackbarType;
  } | null>(null);

  const screen = Dimensions.get('window');

  const source = origin || {
    x: screen.width / 2 - 22,
    y: screen.height / 2 - 22,
    size: 44,
  };
  const anchorX = source.x + source.size / 2;
  const anchorY = source.y + source.size / 2;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateX: (anchorX - screen.width / 2) * (1 - progress.value) },
      { translateY: (anchorY - screen.height / 2) * (1 - progress.value) },
      { scale: 0.15 + progress.value * 0.85 },
    ],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropProgress.value,
  }));

  const finishClose = () => {
    setClosing(false);
    onClose();
  };

  const closeModal = () => {
    if (closing) return;
    setClosing(true);
    backdropProgress.value = withTiming(0, { duration: 50 });
    progress.value = withTiming(0, { duration: 200 }, finished => {
      if (finished) runOnJS(finishClose)();
    });
  };

  const normalized = useMemo(() => {
    const fullName =
      valueOrEmpty(member?.full_name) || valueOrEmpty(member?.name);
    const username =
      valueOrEmpty(member?.username) || valueOrEmpty(member?.user_name);

    return {
      name: fullName || 'Name unavailable',
      username,
      email: valueOrEmpty(member?.email),
      role: valueOrEmpty(member?.role),
      color: valueOrEmpty(member?.color) || colors.primary,
      organization: valueOrEmpty(member?.organization_name),
      avatarUrl: valueOrEmpty(member?.avatar_url),
    };
  }, [colors.primary, member]);

  useEffect(() => {
    if (!visible) return;
    setClosing(false);
    cancelAnimation(progress);
    cancelAnimation(backdropProgress);
    progress.value = 0;
    backdropProgress.value = 0;
    progress.value = withTiming(1, { duration: 250 });
    backdropProgress.value = withTiming(1, { duration: 250 });
  }, [progress, backdropProgress, visible]);

  const initials =
    normalized.name === 'Name unavailable'
      ? '?'
      : normalized.name
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map(part => part[0])
          .join('')
          .toUpperCase();

  const handleCopy = (value: string, label: string) => {
    if (!value) {
      setSnackbar({
        message: `No ${label.toLowerCase()} available to copy.`,
        type: 'info',
      });
      return;
    }
    try {
      Clipboard.setString(value);
      setSnackbar({
        message: `${label} copied to clipboard.`,
        type: 'success',
      });
    } catch {
      setSnackbar({
        message: `Could not copy ${label.toLowerCase()}.`,
        type: 'error',
      });
    }
  };

  const renderRow = (options: {
    icon: string;
    iconColor: string;
    iconBgColor: string;
    label: string;
    value: string;
    canCopy?: boolean;
    isLast?: boolean;
  }) => {
    const {
      icon,
      iconColor,
      iconBgColor,
      label,
      value,
      canCopy = false,
      isLast = false,
    } = options;

    const displayValue = value || 'Not available';
    const isAvailable = Boolean(value);

    return (
      <View
        key={label}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: moderateScale(13),
          paddingHorizontal: moderateScale(16),
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: colors.border,
        }}
      >
        <View
          style={{
            width: moderateScale(40),
            height: moderateScale(40),
            borderRadius: Radius.sm,
            backgroundColor: iconBgColor,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: moderateScale(14),
          }}
        >
          <Ionicons
            name={icon as any}
            size={moderateScale(19)}
            color={iconColor}
          />
        </View>

        <View style={{ flex: 1, marginRight: moderateScale(8) }}>
          <AppText
            variant='caption'
            style={{
              color: colors.textSecondary,
              fontSize: moderateScale(11),
              fontWeight: '500',
              marginBottom: 2,
              letterSpacing: 0.2,
              textTransform: 'uppercase',
            }}
          >
            {label}
          </AppText>
          <AppText
            variant='body'
            numberOfLines={1}
            style={{
              color: isAvailable ? colors.text : colors.placeholder,
              fontWeight: isAvailable ? '600' : '400',
              fontSize: moderateScale(14),
            }}
          >
            {displayValue}
          </AppText>
        </View>

        {canCopy && isAvailable ? (
          <TouchableOpacity
            onPress={() => handleCopy(value, label)}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            accessibilityRole='button'
            accessibilityLabel={`Copy ${label}`}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: `${colors.primary}18`,
              paddingHorizontal: moderateScale(10),
              paddingVertical: moderateScale(6),
              borderRadius: Radius.sm,
              gap: moderateScale(4),
              borderWidth: 1,
              borderColor: `${colors.primary}40`,
            }}
          >
            <Ionicons
              name='copy-outline'
              size={moderateScale(13)}
              color={colors.primary}
            />
            <AppText
              variant='caption'
              style={{
                color: colors.primary,
                fontWeight: '600',
                fontSize: moderateScale(11),
              }}
            >
              Copy
            </AppText>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <Modal
      transparent
      visible={visible || closing}
      animationType='none'
      onRequestClose={closeModal}
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: moderateScale(20),
        }}
      >
        <Animated.View
          pointerEvents='none'
          style={[
            {
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.72)',
            },
            backdropStyle,
          ]}
        />
        {/* Backdrop touch target */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeModal}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          }}
          accessibilityLabel='Close member details'
        />

        <Animated.View
          style={[
            {
              width: '100%',
              maxWidth: 400,
              backgroundColor: colors.card,
              borderRadius: Radius.sm,
              overflow: 'hidden',
              shadowColor: colors.black,
              shadowOffset: { width: 0, height: 18 },
              shadowOpacity: 0.16,
              shadowRadius: 28,
              elevation: 20,
            },
            animatedStyle,
          ]}
        >
          {/* Header Section */}
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              height: moderateScale(125),
              gap: moderateScale(12),
              paddingTop: moderateScale(22),
              paddingHorizontal: moderateScale(18),
              paddingBottom: moderateScale(18),
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {/* Avatar & Indicator */}
            <View style={{ position: 'relative' }}>
              <View
                style={{
                  width: moderateScale(62),
                  height: moderateScale(62),
                  borderRadius: moderateScale(31),
                  backgroundColor: normalized.color,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  borderWidth: 2,
                  borderColor: colors.card,
                  shadowColor: colors.black,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Avatar
                  dimension={moderateScale(62)}
                  initials={initials}
                  color={normalized.color || colors.primary}
                  imageUrl={normalized.avatarUrl}
                />
              </View>
              <View
                style={{
                  position: 'absolute',
                  bottom: moderateScale(2),
                  right: moderateScale(2),
                  width: moderateScale(14),
                  height: moderateScale(14),
                  borderRadius: moderateScale(7),
                  backgroundColor: colors.success,
                  borderWidth: 2,
                  borderColor: colors.card,
                }}
              />
            </View>

            {/* Profile Info */}
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <AppText
                variant='h3'
                style={{
                  color: colors.white,
                  fontWeight: '700',
                  fontSize: moderateScale(17),
                  letterSpacing: -0.3,
                }}
                numberOfLines={1}
              >
                {normalized.name}
              </AppText>

              {normalized.username ? (
                <AppText
                  variant='caption'
                  style={{
                    color: 'rgba(255, 255, 255, 0.82)',
                    fontSize: moderateScale(13),
                    marginTop: 1,
                  }}
                >
                  @{normalized.username}
                </AppText>
              ) : null}

              {normalized.role ? (
                <View
                  style={{
                    alignSelf: 'flex-start',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: moderateScale(4),
                    marginTop: moderateScale(6),
                    paddingHorizontal: moderateScale(8),
                    paddingVertical: moderateScale(3),
                    borderRadius: moderateScale(6),
                    backgroundColor: 'rgba(255, 255, 255, 0.18)',
                  }}
                >
                  <Ionicons
                    name='sparkles'
                    size={moderateScale(11)}
                    color={colors.white}
                  />
                  <AppText
                    variant='caption'
                    style={{
                      color: colors.white,
                      fontWeight: '700',
                      fontSize: moderateScale(10),
                      letterSpacing: 0.2,
                    }}
                  >
                    {formatRoleBadge(normalized.role)}
                  </AppText>
                </View>
              ) : null}
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={closeModal}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole='button'
              accessibilityLabel='Close modal'
              style={{
                width: moderateScale(34),
                height: moderateScale(34),
                borderRadius: moderateScale(17),
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.35)',
                shadowColor: colors.black,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
              }}
            >
              <Ionicons
                name='close'
                size={moderateScale(18)}
                color={colors.white}
              />
            </TouchableOpacity>
          </LinearGradient>

          {/* Details Scroll Area */}
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: moderateScale(16),
              paddingTop: moderateScale(14),
              paddingBottom: moderateScale(16),
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Details List */}
            <View
              style={{
                borderRadius: Radius.sm,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.card,
                overflow: 'hidden',
              }}
            >
              {renderRow({
                icon: 'person-outline',
                iconColor: colors.primary,
                iconBgColor: `${colors.primary}18`,
                label: 'Full Name',
                value:
                  normalized.name === 'Name unavailable' ? '' : normalized.name,
              })}

              {renderRow({
                icon: 'at-outline',
                iconColor: colors.success,
                iconBgColor: `${colors.success}18`,
                label: 'Username',
                value: normalized.username,
              })}

              {renderRow({
                icon: 'mail-outline',
                iconColor: colors.secondary,
                iconBgColor: `${colors.secondary}18`,
                label: 'Email',
                value: normalized.email,
                canCopy: true,
              })}

              {renderRow({
                icon: 'ribbon-outline',
                iconColor: colors.warning,
                iconBgColor: `${colors.warning}18`,
                label: 'Role',
                value: normalized.role,
              })}

              {renderRow({
                icon: 'business-outline',
                iconColor: colors.accentPurple,
                iconBgColor: `${colors.accentPurple}18`,
                label: 'Organization Name',
                value: normalized.organization,
                isLast: true,
              })}
            </View>

            {/* Footer Banner */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderRadius: Radius.sm,
                paddingVertical: moderateScale(9),
                paddingHorizontal: moderateScale(12),
                marginTop: moderateScale(12),
                gap: moderateScale(8),
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Ionicons
                name='information-circle-outline'
                size={moderateScale(15)}
                color={colors.placeholder}
              />
              <AppText
                variant='caption'
                style={{
                  color: colors.textSecondary,
                  fontSize: moderateScale(11),
                  flexShrink: 1,
                }}
              >
                Member details are shown based on available information.[cite:
                2]
              </AppText>
            </View>
          </ScrollView>
        </Animated.View>
        <CustomSnackbar
          visible={Boolean(snackbar)}
          onDismiss={() => setSnackbar(null)}
          message={snackbar?.message ?? ''}
          type={snackbar?.type ?? 'default'}
          bottomOffset={30}
        />
      </View>
    </Modal>
  );
};

export default MemberDetailsModal;
