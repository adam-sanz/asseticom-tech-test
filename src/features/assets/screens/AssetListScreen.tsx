import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text } from 'react-native-paper';

type AssetListScreenProps = {
  onLogout: () => Promise<void>;
};

export function AssetListScreen({ onLogout }: AssetListScreenProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <Text variant="headlineMedium">Asset List</Text>
      <Button
        disabled={isPending}
        loading={isPending}
        mode="outlined"
        onPress={handleLogout}
      >
        Log out
      </Button>
      <HelperText type="error" visible={Boolean(error)}>
        {error}
      </HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: 16,
    justifyContent: 'center',
    padding: 24,
  },
});
