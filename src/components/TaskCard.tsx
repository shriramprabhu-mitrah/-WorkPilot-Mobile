import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigationTypes';
import { useNavigation } from '@react-navigation/native';

const TaskCard = ({ item }: any) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('issue', { id: item.id })}
      className='mb-4 gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2 shadow-sm'
    >
      <Text className='text-md font-medium leading-6 text-gray-900'>
        {item.title}
      </Text>
      <View className='flex-row items-center justify-between'>
        <View className='flex-row items-center'>
          <View
            style={{ backgroundColor: item.avatarColor }}
            className='h-5 w-5 items-center justify-center rounded'
          >
            <Text className='text-[10px] font-bold text-white'>
              {item.avatar}
            </Text>
          </View>
          <Text className='ml-2 text-sm text-gray-500'>{item.id}</Text>
        </View>
        <View className='flex-row items-center'>
          <View
            style={{ backgroundColor: item.priority }}
            className='mr-2 h-2 w-2 rounded-full'
          />
          <View className='rounded bg-gray-100 px-2 py-1'>
            <Text className='text-xs font-semibold text-gray-500'>
              {item.points}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TaskCard;
