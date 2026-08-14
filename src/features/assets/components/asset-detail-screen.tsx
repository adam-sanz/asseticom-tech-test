import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, Button, HelperText, Icon, Text, TextInput } from 'react-native-paper';

import { createAsset, deleteAsset, getAsset, updateAsset } from '../api/asset-api';
import { assetDescriptionSchema } from '../api/asset-schema';
import type { Asset } from '../types/asset';

type AssetDetailScreenProps = {
  assetId?: string;
  onCreated: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
};

type UpdateAssetInput = {
  assetId: string;
  description: string;
};

function formatAssetDate(created: Asset['created']) {
  return created.toDate().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function AssetDetailScreen({ assetId, onCreated, onDeleted, onUpdated }: AssetDetailScreenProps) {
  const [description, setDescription] = useState<string>();

  const [validationError, setValidationError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const isEditMode = assetId !== undefined && assetId !== '';

  const assetQuery = useQuery({
    enabled: isEditMode,
    queryFn: () => getAsset(assetId ?? ''),
    queryKey: ['assets', assetId],
  });

  const createMutation = useMutation({
    mutationFn: createAsset,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ exact: true, queryKey: ['assets'] });
      onCreated();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateAssetInput) => updateAsset(input.assetId, input.description),
    onSuccess: async (_, input) => {
      setDescription(input.description);
      await Promise.all([
        queryClient.invalidateQueries({ exact: true, queryKey: ['assets'] }),
        queryClient.invalidateQueries({
          exact: true,
          queryKey: ['assets', input.assetId],
        }),
      ]);
      onUpdated();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAsset,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ exact: true, queryKey: ['assets'] });
      queryClient.removeQueries({
        exact: true,
        queryKey: ['assets', assetId],
      });
      onDeleted();
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const hasDescriptionChanged = description !== undefined && description.trim() !== assetQuery.data?.description;

  const createdDate = isEditMode && assetQuery.data ? formatAssetDate(assetQuery.data.created) : null;

  const hasValidationError = validationError !== null;

  function handleSubmit() {
    if (isPending || (isEditMode && !hasDescriptionChanged)) {
      return;
    }

    const result = assetDescriptionSchema.safeParse(description ?? '');

    if (!result.success) {
      setValidationError(result.error.issues[0]?.message ?? 'Description is required.');
      return;
    }

    setValidationError(null);

    if (assetId) {
      updateMutation.mutate({ assetId, description: result.data });
    } else {
      createMutation.mutate(result.data);
    }
  }

  function handleDelete() {
    if (!assetId || isPending) return;

    Alert.alert('Delete asset?', 'This action cannot be undone.', [
      { style: 'cancel', text: 'Cancel' },
      {
        onPress: () => {
          if (!deleteMutation.isPending) {
            deleteMutation.mutate(assetId);
          }
        },
        style: 'destructive',
        text: 'Delete',
      },
    ]);
  }

  function handleRetry() {
    void assetQuery.refetch();
  }

  if (isEditMode && assetQuery.isPending) {
    return (
      <View style={styles.state}>
        <ActivityIndicator />
        <Text variant="titleMedium">Loading asset...</Text>
      </View>
    );
  }

  if (isEditMode && assetQuery.isError) {
    return (
      <View style={styles.state}>
        <Text variant="titleMedium">Could not load the asset.</Text>
        <Button mode="outlined" onPress={handleRetry}>
          Try again
        </Button>
      </View>
    );
  }

  if (isEditMode && !assetQuery.data) {
    return (
      <View style={styles.state}>
        <Text variant="titleMedium">Asset not found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.card}>
            <TextInput
              error={hasValidationError}
              label="Description"
              multiline
              onChangeText={setDescription}
              onSubmitEditing={handleSubmit}
              placeholder="Describe the asset"
              returnKeyType="done"
              style={styles.descriptionInput}
              value={description ?? assetQuery.data?.description ?? ''}
              mode="outlined"
            />
            <HelperText type="error" visible={hasValidationError}>
              {validationError}
            </HelperText>
          </View>

          {createdDate ? (
            <View style={styles.infoCard}>
              <View style={styles.infoLabelGroup}>
                <Icon color="#2563EB" source="calendar-outline" size={20} />
                <Text style={styles.infoLabel} variant="bodyMedium">
                  Created
                </Text>
              </View>
              <Text variant="bodyLarge">{createdDate}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <Button
              contentStyle={styles.buttonContent}
              disabled={isPending || (isEditMode && !hasDescriptionChanged)}
              loading={createMutation.isPending || updateMutation.isPending}
              mode="contained"
              onPress={handleSubmit}
              icon={isEditMode ? 'content-save-outline' : 'plus'}
            >
              {isEditMode ? 'Save' : 'Create'}
            </Button>

            {isEditMode ? (
              <Button
                contentStyle={styles.buttonContent}
                disabled={isPending}
                loading={deleteMutation.isPending}
                mode="outlined"
                onPress={handleDelete}
                style={styles.deleteButton}
                textColor="#DC2626"
                icon="delete-outline"
              >
                Delete
              </Button>
            ) : null}
          </View>

          <HelperText type="error" visible={createMutation.isError || updateMutation.isError}>
            {isEditMode ? 'Could not save the asset. Try again.' : 'Could not create the asset. Try again.'}
          </HelperText>
          <HelperText type="error" visible={deleteMutation.isError}>
            Could not delete the asset. Try again.
          </HelperText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: 12,
  },
  buttonContent: {
    minHeight: 48,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderCurve: 'continuous',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  container: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
  },
  deleteButton: {
    borderColor: '#DC2626',
  },
  descriptionInput: {
    minHeight: 128,
    textAlignVertical: 'top',
  },
  form: {
    gap: 16,
  },
  infoCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderCurve: 'continuous',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  infoLabel: {
    color: '#64748B',
  },
  infoLabelGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  state: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
});
