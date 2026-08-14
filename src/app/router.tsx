import { Platform, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator, type NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Text } from 'react-native-paper';

import { AssetDetailScreen } from '@/features/assets/components/asset-detail-screen';
import { AssetListScreen } from '@/features/assets/components/asset-list-screen';
import { logout } from '@/features/auth/api/auth-api';
import { LoginScreen } from '@/features/auth/components/login-screen';
import { useAuthStore } from '@/features/auth/stores/auth-store';

import { appTheme } from './theme';

export type RootStackParamList = {
  Login: undefined;
  AssetList: undefined;
  AssetDetail: { assetId?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function AuthenticatedAssetListScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'AssetList'>) {
  function handleAddAsset() {
    navigation.navigate('AssetDetail');
  }

  function handleSelectAsset(assetId: string) {
    navigation.navigate('AssetDetail', { assetId });
  }

  return <AssetListScreen onAddAsset={handleAddAsset} onLogout={logout} onSelectAsset={handleSelectAsset} />;
}

function AuthenticatedAssetDetailScreen({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'AssetDetail'>) {
  function handleDone() {
    navigation.goBack();
  }

  return (
    <AssetDetailScreen
      assetId={route.params?.assetId}
      onCreated={handleDone}
      onDeleted={handleDone}
      onUpdated={handleDone}
    />
  );
}

export function AppRouter() {
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
      screenOptions={{
        contentStyle: { backgroundColor: appTheme.colors.background },
        headerStyle: { backgroundColor: appTheme.colors.surface },
        headerTintColor: appTheme.colors.primary,
        headerTitleStyle: { color: appTheme.colors.onSurface },
      }}
    >
      {user ? (
        <>
          <Stack.Screen
            name="AssetList"
            component={AuthenticatedAssetListScreen}
            options={{
              headerTitleAlign: Platform.OS === 'android' ? 'center' : undefined,
              title: 'Assets',
            }}
          />
          <Stack.Screen
            name="AssetDetail"
            component={AuthenticatedAssetDetailScreen}
            options={({ route }) => ({
              title: route.params?.assetId ? 'Asset detail' : 'Create asset',
            })}
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
