import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export function AssetDetailScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">Asset Detail</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
