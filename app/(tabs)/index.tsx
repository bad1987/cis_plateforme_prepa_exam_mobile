import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import contentService, { Exam, QuizSession } from '@/services/contentService';

export default function HomeScreen() {
  const { user } = useAuth();
  const [recentQuizzes, setRecentQuizzes] = useState<QuizSession[]>([]);
  const [popularExams, setPopularExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch recent quizzes
        const quizHistory = await contentService.getQuizHistory();
        setRecentQuizzes(quizHistory.slice(0, 3)); // Get only the 3 most recent

        // Fetch exams
        const exams = await contentService.getExams();
        setPopularExams(exams.slice(0, 3)); // Get only 3 exams for display
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const calculatePercentage = (score: number, total: number) => {
    return Math.round((score / total) * 100);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Home', headerShown: true }} />
      <ScrollView style={styles.container}>
        {/* Welcome Section */}
        <ThemedView style={styles.welcomeSection}>
          <ThemedText type="title" style={styles.welcomeTitle}>
            Welcome, {user?.username || 'Student'}!
          </ThemedText>
          <ThemedText style={styles.welcomeSubtitle}>
            Continue your exam preparation journey
          </ThemedText>
        </ThemedView>

        {/* Quick Actions */}
        <ThemedView style={styles.actionsSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick Actions
          </ThemedText>
          <ThemedView style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/exams')}
            >
              <ThemedText style={styles.actionButtonText}>Browse Exams</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/quiz-history')}
            >
              <ThemedText style={styles.actionButtonText}>Quiz History</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* Recent Quizzes */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Recent Quizzes
          </ThemedText>
          {recentQuizzes.length > 0 ? (
            <ThemedView style={styles.quizList}>
              {recentQuizzes.map((quiz) => (
                <ThemedView key={quiz.id} style={styles.quizItem}>
                  <ThemedText style={styles.quizSubject}>{quiz.subject.name}</ThemedText>
                  <ThemedView style={styles.quizDetails}>
                    <ThemedText style={styles.quizScore}>
                      Score: {quiz.score}/{quiz.totalQuestions} ({calculatePercentage(quiz.score, quiz.totalQuestions)}%)
                    </ThemedText>
                    <ThemedText style={styles.quizDate}>
                      {formatDate(quiz.endTime)}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              ))}
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => router.push('/quiz-history')}
              >
                <ThemedText style={styles.viewAllButtonText}>View All Quizzes</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ) : (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>
                You haven't taken any quizzes yet.
              </ThemedText>
              <TouchableOpacity
                style={styles.startButton}
                onPress={() => router.push('/(tabs)/exams')}
              >
                <ThemedText style={styles.startButtonText}>Start a Quiz</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>

        {/* Popular Exams */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Available Exams
          </ThemedText>
          {popularExams.length > 0 ? (
            <ThemedView style={styles.examList}>
              {popularExams.map((exam) => (
                <TouchableOpacity
                  key={exam.id}
                  style={styles.examItem}
                  onPress={() => router.push({
                    pathname: '/exams/[examId]/subjects' as any,
                    params: { examId: exam.id }
                  })}
                >
                  <ThemedText style={styles.examName}>{exam.name}</ThemedText>
                  <ThemedText style={styles.examDescription} numberOfLines={2}>
                    {exam.description}
                  </ThemedText>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => router.push('/(tabs)/exams')}
              >
                <ThemedText style={styles.viewAllButtonText}>View All Exams</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          ) : (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>
                No exams available at the moment.
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  actionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  quizList: {
    marginBottom: 8,
  },
  quizItem: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  quizSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quizDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quizScore: {
    fontSize: 14,
  },
  quizDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  examList: {
    marginBottom: 8,
  },
  examItem: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  examName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  examDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  viewAllButtonText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  emptyStateText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
