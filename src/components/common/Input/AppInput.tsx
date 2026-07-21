import React from 'react';
import {TextInput,TextInputProps,View,} from 'react-native';
import { Radius } from '../../../constants/Radius';
import { useTheme } from '../../../hooks/useTheme';
import AppText from '../AppText';
import { useResponsive } from '../../../utils/responsive';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

const AppInput = ({label,error,style,...props}: Props) => {

  const {colors} = useTheme();
  const {wp,hp} = useResponsive();

  return (
    <View>
      {label &&
        <AppText
          variant="body"
          style={{marginBottom: hp(1)}}>
          {label}
        </AppText>}
      <TextInput
        placeholderTextColor={colors.placeholder}
        style={[
          {backgroundColor:colors.surface,
            borderWidth: 1,
            borderColor:colors.border,
            borderRadius:Radius.md,
            paddingHorizontal:wp(4),
            paddingVertical:hp(2),
            color:colors.text,
          },
          style
        ]}
        {...props}
      />
      {!!error &&
        <AppText
          variant="caption"
          color={colors.error}
          style={{marginTop: hp(0.5)}}
        >
          {error}
        </AppText>
      }
    </View>
  )}


export default AppInput;