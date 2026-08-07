import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  className?: string;
  backgroundColor?: string;
}

const Screen = ({
  children,
  scroll = false,
  className = '',
  backgroundColor,
}: Props) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: backgroundColor ?? colors.background }}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
        style={{
          flex: 1,
          backgroundColor: backgroundColor ?? colors.background,
        }}
      >
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps='handled'
            showsVerticalScrollIndicator={false}
            keyboardDismissMode='interactive'
            contentContainerStyle={{
              flexGrow: 1,
            }}
          >
            <View style={{ flexGrow: 1 }} className={className}>
              {children}
            </View>
          </ScrollView>
        ) : (
          <View style={{ flex: 1 }} className={className}>
            {children}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Screen;
