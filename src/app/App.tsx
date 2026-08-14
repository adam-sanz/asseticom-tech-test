import { AppProviders } from './providers';
import { AppNavigator } from './navigation/AppNavigator';

export default function App() {
  return (
    <AppProviders>
      <AppNavigator />
    </AppProviders>
  );
}
