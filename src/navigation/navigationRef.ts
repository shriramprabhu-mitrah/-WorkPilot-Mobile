import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigationTypes';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T],
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
