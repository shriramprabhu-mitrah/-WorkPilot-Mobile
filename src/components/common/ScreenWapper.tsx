import React from 'react';
import {KeyboardAvoidingView,Platform,ScrollView,View,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  className?: string;
}

const Screen = ({children,scroll = false,className = ''}: Props) => {

  const { colors } = useTheme();

  return (
    <SafeAreaView style={{flex:1,backgroundColor:colors.background}}>
      <KeyboardAvoidingView
        style={{flex:1}}
        behavior={Platform.OS === 'ios'? 'padding': undefined}
      >
        {scroll ?
          (<ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom:30
            }}
          >
            <View className={className}>
              {children}
            </View>
          </ScrollView>)
          : (
          <View className={`flex-1 ${className}`}>
            {children}
          </View>)
        }
      </KeyboardAvoidingView>
    </SafeAreaView>)}


export default Screen;