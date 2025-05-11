import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import contentService, { Exam } from '@/services/contentService';

export default function ExamsScreen() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await contentService.getExams();
      setExams(data);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to load exams'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExamPress = (examId: number) => {
    router.push({
      pathname: '/exams/[examId]/subjects' as any,
      params: { examId }
    });
  };

  const renderExamItem = ({ item }: { item: Exam }) => (
    <TouchableOpacity
      style={styles.examItem}
      onPress={() => handleExamPress(item.id)}
    >
      <ThemedView
        variant="surface"
        style={[
          styles.examCard,
          { borderColor: Colors[colorScheme].border }
        ]}
      >
        <ThemedText style={styles.examName}>{item.name}</ThemedText>
        <ThemedText variant="secondary" style={styles.examDescription}>
          {item.description}
        </ThemedText>
        {item.countryCode && (
          <ThemedText variant="secondary" style={styles.countryCode}>
            Country: {item.countryCode}
          </ThemedText>
        )}
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Exams', headerShown: true }} />
      <ThemedView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} style={styles.loader} />
        ) : exams.length > 0 ? (
          <FlatList
            data={exams}
            renderItem={renderExamItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <ThemedView 
            variant="surface"
            style={[
              styles.emptyContainer,
              { borderColor: Colors[colorScheme].border }
            ]}
          >
            <ThemedText variant="secondary" style={styles.emptyText}>No exams available</ThemedText>
            <TouchableOpacity 
              style={[styles.refreshButton, { backgroundColor: Colors[colorScheme].tint }]}
              onPress={fetchExams}
            >
              <ThemedText style={styles.refreshButtonText}>Refresh</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  examItem: {
    marginBottom: 16,
  },
  examCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  examName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  examDescription: {
    marginBottom: 8,
  },
  countryCode: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 16,
  },
  refreshButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
