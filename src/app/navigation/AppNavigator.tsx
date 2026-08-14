import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AssetDetailScreen } from '../../features/assets/screens/AssetDetailScreen';
import { AssetListScreen } from '../../features/assets/screens/AssetListScreen';
import { LoginScreen } from '../../features/auth/screens/LoginScreen';

export type RootStackParamList = {
  Login: undefined;
  AssetList: undefined;
  AssetDetail: { assetId?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="AssetList" component={AssetListScreen} options={{ title: 'Assets' }} />
      <Stack.Screen name="AssetDetail" component={AssetDetailScreen} options={{ title: 'Asset detail' }} />
    </Stack.Navigator>
  );
}
