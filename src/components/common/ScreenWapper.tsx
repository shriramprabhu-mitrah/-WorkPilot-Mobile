import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useAuthLayout } from '../../hooks/useAuthLayout';

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
  const { layout, moderateScale, isSmallHeight } = useAuthLayout();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: backgroundColor ?? colors.background }}
      edges={['top']}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps='handled'
            showsVerticalScrollIndicator={false}
            keyboardDismissMode='interactive'
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 40,
            }}
          >
            <View style={{ flexGrow: 1 }} className={className}>
              {children}
            </View>
          </ScrollView>
        ) : (
          <View className={`flex-1 ${className}`}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Screen;
