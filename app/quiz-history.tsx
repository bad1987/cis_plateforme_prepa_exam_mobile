import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import contentService, { QuizSession } from '@/services/contentService';

export default function QuizHistoryScreen() {
  const [quizHistory, setQuizHistory] = useState<QuizSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizHistory();
  }, []);

  const fetchQuizHistory = async () => {
    try {
      setLoading(true);
      const data = await contentService.getQuizHistory();
      setQuizHistory(data);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to load quiz history'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const calculatePercentage = (score: number, total: number) => {
    return Math.round((score / total) * 100);
  };

  const renderQuizItem = ({ item }: { item: QuizSession }) => (
    <ThemedView style={styles.quizItem}>
      <ThemedView style={styles.quizHeader}>
        <ThemedText type="subtitle" style={styles.subjectName}>
          {item.subject.name}
        </ThemedText>
        <ThemedText style={styles.scoreText}>
          {item.score}/{item.totalQuestions} ({calculatePercentage(item.score, item.totalQuestions)}%)
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.quizDetails}>
        <ThemedText style={styles.dateText}>
          Completed: {formatDate(item.endTime)}
        </ThemedText>
        
        <ThemedView style={styles.scoreIndicator}>
          <ThemedView 
            style={[
              styles.scoreBar, 
              { width: `${calculatePercentage(item.score, item.totalQuestions)}%` },
              calculatePercentage(item.score, item.totalQuestions) >= 70 
                ? styles.goodScore 
                : calculatePercentage(item.score, item.totalQuestions) >= 50 
                  ? styles.averageScore 
                  : styles.poorScore
            ]} 
          />
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Quiz History',
        headerShown: true 
      }} />
      <ThemedView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
        ) : quizHistory.length > 0 ? (
          <FlatList
            data={quizHistory}
            renderItem={renderQuizItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No quiz history available</ThemedText>
            <TouchableOpacity 
              style={styles.takeQuizButton} 
              onPress={() => router.push('/(tabs)/exams')}
            >
              <ThemedText style={styles.takeQuizButtonText}>Take a Quiz</ThemedText>
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
  quizItem: {
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quizDetails: {
    marginTop: 8,
  },
  dateText: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  scoreIndicator: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreBar: {
    height: '100%',
  },
  goodScore: {
    backgroundColor: '#4CAF50',
  },
  averageScore: {
    backgroundColor: '#FFC107',
  },
  poorScore: {
    backgroundColor: '#F44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 16,
  },
  takeQuizButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  takeQuizButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
