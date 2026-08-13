import { View } from 'react-native';
import Screen from '../../components/common/ScreenWapper';
import { AppText } from '../../components';

const Report = () => {
  return (
    <Screen scroll={false}>
      <View className='flex-1 items-center justify-center'>
        <AppText variant='body'>Report Screen</AppText>
      </View>
    </Screen>
  );
};
export default Report;
