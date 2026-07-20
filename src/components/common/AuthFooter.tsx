import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import AppText from '../common/AppText';
import { useTheme } from '../../hooks/useTheme';
import { useResponsive } from '../../utils/responsive';

interface Props {
  title: string;
  actionText: string;
  onPress: () => void;
}

const AuthFooter = ({ title, actionText, onPress }: Props) => {
  const { colors } = useTheme();
  const { wp } = useResponsive();

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
      <AppText variant="body" color={colors.textSecondary}>
        {title}
      </AppText>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={{ paddingHorizontal: wp(2) }}>
        <AppText variant="body" color={colors.primary}>
          {actionText}
        </AppText>
      </TouchableOpacity>
    </View>
  );
};

export default AuthFooter;
