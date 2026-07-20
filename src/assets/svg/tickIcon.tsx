import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

interface Props {
    width?: number;
    height?: number;
}

const TickIcon = ({
    width = 40,
    height = 40,
}: Props) => {
    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 40 40"
            fill="none"
        >
            <Circle
                cx="20"
                cy="20"
                r="20"
                fill="#E3FCEF"
            />
            <Path
                d="M11 20L17 26L29 14"
                stroke="#36B37E"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </Svg>
    );
};

export default TickIcon;