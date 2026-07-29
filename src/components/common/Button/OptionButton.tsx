import { Text, TouchableOpacity, View } from 'react-native';

const OptionButton = (props: any) => {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      className={`mb-3 mr-3 w-auto rounded-xl border-2 px-4 py-3 ${props.selected ? 'border-blue-600 bg-blue-100' : 'border-gray-300'}`}
    >
      <View className='flex-row items-center'>
        <View
          style={{ backgroundColor: props.color }}
          className='h-6 w-6 items-center justify-center rounded'
        >
          <Text className='text-xs font-bold text-white'>{props.icon}</Text>
        </View>
        <Text className='ml-2 font-semibold'>{props.title}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default OptionButton;
