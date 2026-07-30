import { TouchableOpacity, View } from 'react-native';
import AppText from '../AppText';
import { useTheme } from '../../../theme/ThemeProvider';
import { Radius } from '../../../constants/Radius';
import { useAuthLayout } from '../../../hooks/useAuthLayout';
import { moderateScale } from '../../../utils/responsive';

interface OptionButtonProps {
  title: string;
  icon: string;
  color?: string;
  selected?: boolean;
  onPress?: () => void;
}

const OptionButton = (props: OptionButtonProps) => {
  const { colors } = useTheme();
  const { layout } = useAuthLayout();
  return (
    <TouchableOpacity
      onPress={props.onPress}
      className={`flex-row items-center border-2`}
      style={{
        borderColor: props.selected ? `${colors.primary}` : `${colors.border}`,
        backgroundColor: props.selected
          ? `${colors.primary}1A`
          : `${colors.surface}`,
        paddingHorizontal: layout.paddingHorizontal * 0.5,
        paddingTop: layout.paddingTop * 0.75,
        paddingBottom: layout.paddingBottom * 0.75,
        gap: layout.sectionGap,
        borderRadius: Radius.sm,
      }}
    >
      <View
        className='flex-row items-center'
        style={{ gap: layout.sectionGap }}
      >
        <View
          style={{
            backgroundColor: props.color,
            borderRadius: Radius.xs,
            width: moderateScale(25),
            height: moderateScale(25),
          }}
          className='items-center justify-center'
        >
          <AppText
            variant='caption'
            style={{ color: colors?.white }}
            className='font-bold'
          >
            {props.icon}
          </AppText>
        </View>
        <AppText
          variant='body'
          className='font-bold'
          style={{
            color: `${props.selected ? colors?.primary : colors?.text}`,
          }}
        >
          {props.title}
        </AppText>
      </View>
    </TouchableOpacity>
  );
};

export default OptionButton;
