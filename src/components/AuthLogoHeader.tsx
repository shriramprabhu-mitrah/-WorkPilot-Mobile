import React from 'react';
import { View } from 'react-native';

import JiraLogo from '../assets/svg/splasScreenlogo';
import AppText from '../components/common/AppText';
import { useTheme } from '../hooks/useTheme';
import { useResponsive } from '../utils/responsive';


interface Props {
  title:string;
  content:string;
}


const AuthLogoHeader = ({
  title,
  content
}:Props) => {

  const { colors } = useTheme();

  const {
    moderateScale,
    fontScale
  } = useResponsive();


  return (

    <View
      style={{
        backgroundColor:colors.primary,
        alignItems:'center',
        justifyContent:'center',
        paddingVertical:moderateScale(20),
        gap:moderateScale(8),
        flex:1
      }}
    >

      <View
        style={{
          backgroundColor:colors.white,
          padding:moderateScale(10),
          borderRadius:moderateScale(16)
        }}
      >

        <JiraLogo
          width={moderateScale(40)}
          height={moderateScale(40)}
        />

      </View>


      <AppText
        variant="h2"
        color={colors.white}
        style={{
          fontSize:fontScale(22)
        }}
      >
        {title}
      </AppText>


      <AppText
        variant="body"
        color={colors.textOnPrimary}
      >
        {content}
      </AppText>


    </View>

  );
};


export default AuthLogoHeader;