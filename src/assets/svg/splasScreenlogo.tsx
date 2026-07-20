import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  width?: number;
  height?: number;
}

const JiraLogo = ({
  width = 48,
  height = 48,
}: Props) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      fill="none"
    >
      <Path
        d="M23.7 4C12.1 4 2.8 13.3 2.8 24.9C2.8 36.5 12.1 45.8 23.7 45.8C35.3 45.8 44.6 36.5 44.6 24.9C44.6 13.3 35.3 4 23.7 4Z"
        fill="#0052CC"
      />

      <Path
        d="M23.7 11L13 31H19.5L23.7 23.1L27.9 31H34.4L23.7 11Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
};

export default JiraLogo;