import { View } from 'react-native';
import { AppText } from '../../components';
import Screen from '../../components/common/ScreenWapper';

const List = () => (
  <Screen scroll={false}>
    <View className='flex-1 items-center justify-center py-10'>
      <AppText variant='body'>List View Content</AppText>
    </View>
  </Screen>
);

export default List;
