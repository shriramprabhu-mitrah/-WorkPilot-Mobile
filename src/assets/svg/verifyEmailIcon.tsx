import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  width?: number;
  height?: number;
}

const VerifyEmailIcon = ({
  width = 36,
  height = 36,
}: Props) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 36 36"
      fill="none"
    >
      <Path
        d="M3 8C3 6.9 3.9 6 5 6H31C32.1 6 33 6.9 33 8V28C33 29.1 32.1 30 31 30H5C3.9 30 3 29.1 3 28V8Z"
        stroke="#0052CC"
        strokeWidth={2}
      />

      <Path
        d="M3 9L18 20L33 9"
        stroke="#0052CC"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default VerifyEmailIcon;