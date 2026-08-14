import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { z } from 'zod';

import { login } from '../api/auth-api';
import { loginSchema, type LoginFormValues } from '../api/auth-schema';

type LoginErrors = Partial<Record<keyof LoginFormValues, string>>;

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const hasEmailError = errors.email !== undefined;
  const hasPasswordError = errors.password !== undefined;
  const hasFormError = formError !== null;

  async function handleSubmit() {
    if (isPending) return;

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

  function handlePasswordVisibility() {
    setIsPasswordVisible((isVisible) => !isVisible);
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View style={styles.header}>
            <Text style={styles.title} variant="headlineMedium">
              Welcome back
            </Text>
            <Text style={styles.subtitle} variant="bodyLarge">
              Sign in to continue to your account.
            </Text>
          </View>

          <View style={styles.fields}>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              error={hasEmailError}
              keyboardType="email-address"
              label="Email"
              left={<TextInput.Icon icon="email-outline" />}
              onChangeText={setEmail}
              placeholder="you@example.com"
              mode="outlined"
              value={email}
            />
            <HelperText type="error" visible={hasEmailError}>
              {errors.email}
            </HelperText>

            <TextInput
              autoCapitalize="none"
              autoComplete="password"
              error={hasPasswordError}
              label="Password"
              left={<TextInput.Icon icon="lock-outline" />}
              onChangeText={setPassword}
              mode="outlined"
              placeholder="Enter your password"
              right={
                <TextInput.Icon
                  accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
                  icon={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  onPress={handlePasswordVisibility}
                />
              }
              secureTextEntry={!isPasswordVisible}
              value={password}
            />
            <HelperText type="error" visible={hasPasswordError}>
              {errors.password}
            </HelperText>
          </View>

          <Button
            disabled={isPending}
            loading={isPending}
            mode="contained"
            onPress={handleSubmit}
            contentStyle={styles.buttonContent}
            style={styles.primaryButton}
          >
            Log in
          </Button>

          <HelperText type="error" visible={hasFormError}>
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
    gap: 8,
  },
  fields: {
    gap: 4,
  },
  header: {
    gap: 8,
    marginBottom: 16,
  },
  primaryButton: {
    marginTop: 8,
  },
  buttonContent: {
    minHeight: 48,
  },
  subtitle: {
    color: '#64748B',
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
  },
});
