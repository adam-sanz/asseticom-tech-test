import { StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Text } from 'react-native-paper';

import { AssetDetailScreen } from '../../features/assets/screens/AssetDetailScreen';
import { AssetListScreen } from '../../features/assets/screens/AssetListScreen';
import { logout } from '../../features/auth/auth-api';
import { LoginScreen } from '../../features/auth/screens/LoginScreen';
import { useAuthStore } from '../../features/auth/auth-store';

export type RootStackParamList = {
  Login: undefined;
  AssetList: undefined;
  AssetDetail: { assetId?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AuthenticatedAssetListScreen() {
  return <AssetListScreen onLogout={logout} />;
}

export function AppNavigator() {
  const user = useAuthStore((state) => state.user);
  const isInitialLoading = useAuthStore((state) => state.isInitialLoading);

  if (isInitialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      key={user ? 'authenticated' : 'unauthenticated'}
      initialRouteName={user ? 'AssetList' : 'Login'}
    >
      {user ? (
        <>
          <Stack.Screen
            name="AssetList"
            component={AuthenticatedAssetListScreen}
            options={{ title: 'Assets' }}
          />
          <Stack.Screen
            name="AssetDetail"
            component={AssetDetailScreen}
            options={{ title: 'Asset detail' }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
});
