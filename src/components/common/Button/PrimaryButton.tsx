import React from 'react';
import {TouchableOpacity,ActivityIndicator,} from 'react-native';
import { Radius } from '../../../constants/Radius';
import { useTheme } from '../../../hooks/useTheme';
import AppText from '../AppText';
import { useResponsive } from '../../../utils/responsive';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: any;
}

const PrimaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  className = '',
  style,
}: Props) => {

  const {colors} = useTheme();
  const {hp} = useResponsive();
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      className={className}
      style={[
        {
          backgroundColor:colors.primary,
          paddingVertical:hp(2),
          borderRadius:Radius.md,
          alignItems: 'center',
          opacity:
            disabled ? 0.6 : 1,
        },
        style
      ]}>
      {loading ?
          <ActivityIndicator color="white" />
          :
          <AppText
            variant="button"
            color="white"
          >
            {title}
          </AppText>}
    </TouchableOpacity>
  )}

export default PrimaryButton;