import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Linking,
} from 'react-native';
import { showSuccessToast } from '../utils/utils';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigationTypes';
import { useNavigation } from '@react-navigation/native';

const SampleLoginScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const handleLogin = () => {
    navigation.navigate('WebLogin');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SampleLoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#1976D2',
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
