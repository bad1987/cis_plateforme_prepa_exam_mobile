import { StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      Alert.alert(
        'Logout Failed',
        error instanceof Error ? error.message : 'An error occurred during logout'
      );
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Profile', headerShown: true }} />
      <ThemedView style={styles.container}>
        <ThemedView 
          variant="surface"
          style={[
            styles.profileCard,
            { borderColor: Colors[colorScheme].border }
          ]}
        >
          <ThemedText type="title" style={styles.title}>
            My Profile
          </ThemedText>

          <ThemedView style={styles.infoContainer}>
            <ThemedText variant="secondary" style={styles.label}>Username</ThemedText>
            <ThemedText style={styles.value}>{user?.username}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.infoContainer}>
            <ThemedText variant="secondary" style={styles.label}>Email</ThemedText>
            <ThemedText style={styles.value}>{user?.email}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors[colorScheme].tint }]}
              onPress={() => router.push('/quiz-history')}
            >
              <ThemedText style={styles.actionButtonText}>Quiz History</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: Colors[colorScheme === 'dark' ? 'dark' : 'light'].error }]} 
            onPress={handleLogout}
          >
            <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionsContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  actionButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
