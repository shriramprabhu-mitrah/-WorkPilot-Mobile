import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AppText from '../AppText';
import { useTheme } from '../../../hooks/useTheme';
import { useResponsive } from '../../../utils/responsive';

interface Props {
  title: string;
  showBack?: boolean;
}

const Header = ({ title, showBack = true }: Props) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { hp, wp, moderateScale } = useResponsive();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: hp(2) }}>
      {showBack ? (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginRight: wp(4) }}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: moderateScale(24) }} />
      )}
      <AppText variant="title">{title}</AppText>
    </View>
  );
};

export default Header;
