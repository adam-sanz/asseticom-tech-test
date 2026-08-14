import { memo, useCallback, useState, type ReactNode } from 'react';
import { Alert, FlatList, Platform, StyleSheet, View, type ListRenderItemInfo } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, Button, HelperText, IconButton, Text } from 'react-native-paper';

import { deleteAsset, getAssets } from '../api/asset-api';
import type { Asset } from '../types/asset';

type AssetListScreenProps = {
  onLogout: () => Promise<void>;
  onAddAsset: () => void;
  onSelectAsset: (assetId: string) => void;
};

type AssetRowProps = {
  id: string;
  description: string;
  created: string;
  isDeleting: boolean;
  onDeleteAsset: (assetId: string) => void;
  onSelectAsset: (assetId: string) => void;
};

function formatAssetDate(created: Asset['created']) {
  return created.toDate().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getAssetKey(asset: Asset) {
  return asset.id;
}

const AssetRow = memo(function AssetRow({
  id,
  description,
  created,
  isDeleting,
  onDeleteAsset,
  onSelectAsset,
}: AssetRowProps) {
  const handleDelete = useCallback(() => onDeleteAsset(id), [id, onDeleteAsset]);
  const handleEdit = useCallback(() => onSelectAsset(id), [id, onSelectAsset]);

  return (
    <View style={styles.row}>
      <View style={styles.rowContent}>
        <Text
          ellipsizeMode={Platform.OS === 'android' ? 'tail' : undefined}
          numberOfLines={Platform.OS === 'android' ? 1 : 2}
          style={styles.rowDescription}
          variant={Platform.OS === 'android' ? 'bodyMedium' : 'bodyLarge'}
        >
          {description}
        </Text>
        <Text style={styles.rowDate} variant="bodyMedium">
          {created}
        </Text>
      </View>
      <View style={styles.rowActions}>
        <IconButton
          accessibilityLabel={`Edit ${description}`}
          disabled={isDeleting}
          icon="pencil-outline"
          iconColor="#2563EB"
          onPress={handleEdit}
          size={Platform.OS === 'android' ? 18 : 24}
          style={styles.rowAction}
        />
        <IconButton
          accessibilityLabel={`Delete ${description}`}
          disabled={isDeleting}
          icon="delete-outline"
          iconColor="#DC2626"
          loading={isDeleting}
          onPress={handleDelete}
          size={Platform.OS === 'android' ? 18 : 24}
          style={styles.rowAction}
        />
      </View>
    </View>
  );
});

export function AssetListScreen({ onLogout, onAddAsset, onSelectAsset }: AssetListScreenProps) {
  const [isPending, setIsPending] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const assetsQuery = useQuery({
    queryKey: ['assets'],
    queryFn: getAssets,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAsset,
    onSuccess: async (_, assetId) => {
      await queryClient.invalidateQueries({ exact: true, queryKey: ['assets'] });
      queryClient.removeQueries({
        exact: true,
        queryKey: ['assets', assetId],
      });
    },
  });

  const assets = assetsQuery.data ?? [];

  const requestDeleteAsset = deleteMutation.mutate;

  const handleDeleteAsset = useCallback(
    (assetId: string) => {
      Alert.alert('Delete asset?', 'This action cannot be undone.', [
        { style: 'cancel', text: 'Cancel' },
        {
          onPress: () => requestDeleteAsset(assetId),
          style: 'destructive',
          text: 'Delete',
        },
      ]);
    },
    [requestDeleteAsset],
  );

  const renderAsset = useCallback(
    ({ item }: ListRenderItemInfo<Asset>) => {
      const created = formatAssetDate(item.created);

      const isDeleting = deleteMutation.isPending && deleteMutation.variables === item.id;

      return (
        <AssetRow
          created={created}
          description={item.description}
          id={item.id}
          isDeleting={isDeleting}
          onDeleteAsset={handleDeleteAsset}
          onSelectAsset={onSelectAsset}
        />
      );
    },
    [deleteMutation.isPending, deleteMutation.variables, handleDeleteAsset, onSelectAsset],
  );

  const feedbackError = error ?? (deleteMutation.isError ? 'Could not delete the asset. Try again.' : null);

  const hasFeedbackError = feedbackError !== null;

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

  function handleRetry() {
    void assetsQuery.refetch();
  }

  let assetsContent: ReactNode;

  if (assetsQuery.isPending) {
    assetsContent = (
      <View style={styles.stateCard}>
        <ActivityIndicator />
        <Text variant="titleMedium">Loading assets...</Text>
      </View>
    );
  } else if (assetsQuery.isError) {
    assetsContent = (
      <View style={styles.stateCard}>
        <Text variant="titleMedium">Could not load the assets.</Text>
        <Text style={styles.stateMessage} variant="bodyMedium">
          Check your connection and try again.
        </Text>
        <Button mode="outlined" onPress={handleRetry}>
          Try again
        </Button>
      </View>
    );
  } else if (assets.length === 0) {
    assetsContent = (
      <View style={styles.stateCard}>
        <Text variant="titleMedium">No assets yet</Text>
        <Text style={styles.stateMessage} variant="bodyMedium">
          Add your first asset to start building your list.
        </Text>
        <Button mode="outlined" onPress={onAddAsset}>
          Add an asset
        </Button>
      </View>
    );
  } else {
    assetsContent = (
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text numberOfLines={1} style={styles.descriptionColumn} variant="labelLarge">
            Description
          </Text>
          <Text numberOfLines={1} style={styles.createdColumn} variant="labelLarge">
            Created
          </Text>
          <Text accessibilityElementsHidden style={styles.actionsColumn}>
            {' '}
          </Text>
        </View>
        <FlatList
          contentContainerStyle={styles.listContent}
          data={assets}
          keyExtractor={getAssetKey}
          renderItem={renderAsset}
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <Button
          contentStyle={styles.buttonContent}
          disabled={isPending}
          mode="contained"
          onPress={onAddAsset}
          icon="plus"
        >
          Add asset
        </Button>
        <Button
          contentStyle={styles.buttonContent}
          disabled={isPending}
          loading={isPending}
          mode="outlined"
          onPress={handleLogout}
          icon="logout"
        >
          Log out
        </Button>
      </View>

      <HelperText type="error" visible={hasFeedbackError}>
        {feedbackError}
      </HelperText>

      <Text style={styles.heading} variant="headlineSmall">
        Your assets
      </Text>

      {assetsContent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    gap: Platform.select({ android: 2, default: 4 }),
    padding: Platform.select({ android: 16, default: 24 }),
  },
  actions: {
    gap: Platform.select({ android: 8, default: 12 }),
    marginBottom: Platform.select({ android: 0, default: 4 }),
  },
  buttonContent: {
    minHeight: Platform.select({ android: 44, default: 48 }),
  },
  createdColumn: {
    color: '#475569',
    flexBasis: Platform.select({ android: 92, default: 104 }),
    fontSize: Platform.select({ android: 13, default: undefined }),
    lineHeight: Platform.select({ android: 18, default: undefined }),
  },
  descriptionColumn: {
    color: '#475569',
    flex: 1,
    fontSize: Platform.select({ android: 13, default: undefined }),
    lineHeight: Platform.select({ android: 18, default: undefined }),
  },
  actionsColumn: {
    flexBasis: Platform.select({ android: 68, default: 80 }),
  },
  heading: {
    fontSize: Platform.select({ android: 22, default: undefined }),
    lineHeight: Platform.select({ android: 28, default: undefined }),
    marginBottom: Platform.select({ android: 4, default: 8 }),
    marginTop: Platform.select({ android: 4, default: 8 }),
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 12,
  },
  row: {
    alignItems: 'center',
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: Platform.select({ android: 4, default: 8 }),
    minHeight: Platform.select({ android: 52, default: 64 }),
    paddingHorizontal: Platform.select({ android: 8, default: 16 }),
    paddingVertical: Platform.select({ android: 6, default: 10 }),
  },
  rowContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: Platform.select({ android: 8, default: 12 }),
  },
  rowAction: {
    margin: 0,
  },
  rowActions: {
    flexBasis: Platform.select({ android: 68, default: 80 }),
    flexDirection: 'row',
  },
  rowDate: {
    color: '#475569',
    flexBasis: Platform.select({ android: 92, default: 104 }),
    fontSize: Platform.select({ android: 13, default: undefined }),
    lineHeight: Platform.select({ android: 18, default: undefined }),
  },
  rowDescription: {
    flex: 1,
    lineHeight: Platform.select({ android: 20, default: undefined }),
  },
  stateCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderCurve: 'continuous',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    minHeight: 180,
    padding: 24,
  },
  stateMessage: {
    color: '#64748B',
    textAlign: 'center',
  },
  table: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderCurve: 'continuous',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    overflow: 'hidden',
  },
  tableHeader: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: Platform.select({ android: 4, default: 8 }),
    minHeight: Platform.select({ android: 40, default: 48 }),
    paddingHorizontal: Platform.select({ android: 8, default: 16 }),
  },
});
