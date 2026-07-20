import React from 'react';

import {
  Text,
  TextProps,
} from 'react-native';


import {
  Typography
} from '../../constants/Typography';


import {
  useTheme
} from '../../hooks/useTheme';


import {
  useResponsive
} from '../../utils/responsive';



interface AppTextProps extends TextProps {
  children: React.ReactNode;
  variant?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'title'
    | 'bodyLarge'
    | 'body'
    | 'caption'
    | 'button';
  color?: string;
  className?: string;
}

const AppText = ({
  children,
  variant = 'body',
  color,
  style,
  className,
  ...props
}: AppTextProps) => {


  const {
    colors
  } = useTheme();



  const {
    moderateScale
  } = useResponsive();



  const typography =
    Typography[variant];



  return (
    <Text
      className={className}
      style={[
        {
          ...typography,

          fontSize:
            typography.fontSize
              ? moderateScale(
                  typography.fontSize
                )
              : undefined,


          lineHeight:
            typography.lineHeight
              ? moderateScale(
                  typography.lineHeight
                )
              : undefined,


          color:
            color || colors.text,

        },


        style,

      ]}


      {...props}

    >

      {children}

    </Text>

  );

};


export default AppText;