import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, HelperText, TextInput } from 'react-native-paper';

import { createAsset } from '../asset-api';
import { assetDescriptionSchema } from '../asset-schema';

type AssetDetailScreenProps = {
  onCreated: () => void;
};

export function AssetDetailScreen({ onCreated }: AssetDetailScreenProps) {
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: createAsset,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['assets'] });
      onCreated();
    },
  });

  function handleCreate() {
    if (createMutation.isPending) {
      return;
    }

    const result = assetDescriptionSchema.safeParse(description);

    if (!result.success) {
      setValidationError(
        result.error.issues[0]?.message ?? 'Description is required.',
      );
      return;
    }

    setValidationError(null);
    createMutation.mutate(result.data);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <TextInput
            error={Boolean(validationError)}
            label="Description"
            onChangeText={setDescription}
            onSubmitEditing={handleCreate}
            returnKeyType="done"
            value={description}
          />
          <HelperText type="error" visible={Boolean(validationError)}>
            {validationError}
          </HelperText>

          <Button
            disabled={createMutation.isPending}
            loading={createMutation.isPending}
            mode="contained"
            onPress={handleCreate}
          >
            Create
          </Button>

          <HelperText type="error" visible={createMutation.isError}>
            Could not create the asset. Try again.
          </HelperText>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  form: {
    gap: 4,
  },
});
