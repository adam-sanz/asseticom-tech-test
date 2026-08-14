import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  HelperText,
  Text,
  TextInput,
} from 'react-native-paper';
import { z } from 'zod';

import { login } from '../auth-api';
import { loginSchema, type LoginFormValues } from '../auth-schema';

type LoginErrors = Partial<Record<keyof LoginFormValues, string>>;

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit() {
    if (isPending) {
      return;
    }

    setFormError(null);

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);

      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setErrors({});
    setIsPending(true);

    try {
      await login(result.data.email, result.data.password);
    } catch {
      setFormError('Could not log in. Check the email and password.');
    } finally {
      setIsPending(false);
    }
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
          <Text style={styles.title} variant="headlineMedium">
            Login
          </Text>

          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            error={Boolean(errors.email)}
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            value={email}
          />
          <HelperText type="error" visible={Boolean(errors.email)}>
            {errors.email}
          </HelperText>

          <TextInput
            autoCapitalize="none"
            autoComplete="password"
            error={Boolean(errors.password)}
            label="Password"
            onChangeText={setPassword}
            secureTextEntry
            value={password}
          />
          <HelperText type="error" visible={Boolean(errors.password)}>
            {errors.password}
          </HelperText>

          <Button
            disabled={isPending}
            loading={isPending}
            mode="contained"
            onPress={handleSubmit}
          >
            Log in
          </Button>

          <HelperText type="error" visible={Boolean(formError)}>
            {formError}
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
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
});
