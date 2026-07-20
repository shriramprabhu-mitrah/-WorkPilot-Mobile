import React from "react";
import Svg, { Path } from "react-native-svg";

const Logo = ({
  width = 32,
  height = 32,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
    >
      <Path
        d="M15.8 2C8.18 2 2 8.18 2 15.8C2 23.42 8.18 29.6 15.8 29.6C23.42 29.6 29.6 23.42 29.6 15.8C29.6 8.18 23.42 2 15.8 2Z"
        fill="#0052CC"
      />

      <Path
        d="M15.8 7.4L8.6 20.8H12.6L15.8 14.8L19 20.8H23L15.8 7.4Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
};

export default Logo;