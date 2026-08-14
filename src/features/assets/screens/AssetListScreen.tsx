import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  Button,
  Divider,
  HelperText,
  List,
  Text,
} from 'react-native-paper';

import { getAssets } from '../asset-api';
import type { Asset } from '../asset-types';

type AssetListScreenProps = {
  onLogout: () => Promise<void>;
  onAddAsset: () => void;
};

function formatAssetDate(created: Asset['created']) {
  return created.toDate().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function AssetListScreen({
  onLogout,
  onAddAsset,
}: AssetListScreenProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const assetsQuery = useQuery({
    queryKey: ['assets'],
    queryFn: getAssets,
  });
  const assets = assetsQuery.data ?? [];

  async function handleLogout() {
    if (isPending) {
      return;
    }

    setError(null);
    setIsPending(true);

    try {
      await onLogout();
    } catch {
      setError('Could not log out. Try again.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <Button disabled={isPending} mode="contained" onPress={onAddAsset}>
          Add asset
        </Button>
        <Button
          disabled={isPending}
          loading={isPending}
          mode="outlined"
          onPress={handleLogout}
        >
          Log out
        </Button>
      </View>

      {assetsQuery.isPending ? (
        <View style={styles.state}>
          <ActivityIndicator />
          <Text>Loading assets...</Text>
        </View>
      ) : assetsQuery.isError ? (
        <View style={styles.state}>
          <Text>Could not load the assets.</Text>
          <Button mode="outlined" onPress={() => void assetsQuery.refetch()}>
            Try again
          </Button>
        </View>
      ) : assets.length === 0 ? (
        <View style={styles.state}>
          <Text>No assets yet.</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={assets}
          ItemSeparatorComponent={Divider}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <List.Item
              description={formatAssetDate(item.created)}
              title={item.description}
            />
          )}
        />
      )}

      <HelperText type="error" visible={Boolean(error)}>
        {error}
      </HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  actions: {
    gap: 12,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  state: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
});
