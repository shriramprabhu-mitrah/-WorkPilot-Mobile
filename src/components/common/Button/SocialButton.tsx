import React from 'react';
import {TouchableOpacity,View} from 'react-native';
import AppText from '../AppText';
import { Radius } from '../../../constants/Radius';
import { useTheme } from '../../../hooks/useTheme';
import { useResponsive } from '../../../utils/responsive';
interface Props {
  title: string;
  icon: React.ReactNode;
  onPress?: () => void;
}

const SocialButton = ({
  title,
  icon,
  onPress
}: Props) => {
  const {colors} = useTheme();
  const {hp,wp} = useResponsive();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor:colors.surface,
        borderWidth: 1,
        borderColor:colors.border,
        borderRadius:Radius.md,
        paddingVertical:hp(2),
        paddingHorizontal:wp(3),
      }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        {icon}
        <AppText
          variant="button"
          color={colors.text}
          style={{marginLeft: wp(3)}}>
          {title}
        </AppText>
      </View>
    </TouchableOpacity>
  )}

export default SocialButton;