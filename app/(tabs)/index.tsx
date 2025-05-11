import { StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import contentService, { Exam, QuizSession } from '@/services/contentService';

export default function HomeScreen() {
  const { user } = useAuth();
  const [recentQuizzes, setRecentQuizzes] = useState<QuizSession[]>([]);
  const [popularExams, setPopularExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch exams first (this is not protected)
        try {
          const exams = await contentService.getExams();
          setPopularExams(exams.slice(0, 3)); // Get only 3 exams for display
        } catch (examError) {
          console.error('Error fetching exams:', examError);
        }

        // Try to fetch quiz history (this is protected and might fail if not authenticated)
        try {
          const quizHistory = await contentService.getQuizHistory();
          setRecentQuizzes(quizHistory.slice(0, 3)); // Get only the 3 most recent
        } catch (quizError) {
          console.log('No quiz history available or not authenticated:', quizError);
          // This is expected for new users or if not authenticated, so we just leave recentQuizzes as empty
        }
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
      <ScrollView>
        <ThemedView style={styles.container}>
          {/* Welcome Section */}
          <ThemedView style={styles.welcomeSection}>
            <ThemedText type="title" style={styles.welcomeTitle}>
              Welcome, {user?.username || 'Student'}!
            </ThemedText>
            <ThemedText variant="secondary" style={styles.welcomeSubtitle}>
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
                style={[styles.actionButton, { backgroundColor: Colors[colorScheme].tint }]}
                onPress={() => router.push('/(tabs)/exams')}
              >
                <ThemedText style={styles.actionButtonText}>Browse Exams</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: Colors[colorScheme].tint }]}
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
                  <ThemedView
                    key={quiz.id}
                    variant="surface"
                    style={styles.quizItem}
                  >
                    <ThemedText style={styles.quizSubject}>{quiz.subject.name}</ThemedText>
                    <ThemedView style={styles.quizDetails}>
                      <ThemedText variant="secondary" style={styles.quizScore}>
                        Score: {quiz.score}/{quiz.totalQuestions} ({calculatePercentage(quiz.score, quiz.totalQuestions)}%)
                      </ThemedText>
                      <ThemedText variant="secondary" style={styles.quizDate}>
                        {formatDate(quiz.endTime)}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                ))}
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => router.push('/quiz-history')}
                >
                  <ThemedText style={[styles.viewAllButtonText, { color: Colors[colorScheme].tint }]}>
                    View All Quizzes
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            ) : (
              <ThemedView
                variant="surface"
                style={styles.emptyState}
              >
                <ThemedText variant="secondary" style={styles.emptyStateText}>
                  You haven't taken any quizzes yet.
                </ThemedText>
                <TouchableOpacity
                  style={[styles.startButton, { backgroundColor: Colors[colorScheme].tint }]}
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
                    <ThemedView
                      variant="surface"
                      style={styles.examCard}
                    >
                      <ThemedText style={styles.examName}>{exam.name}</ThemedText>
                      <ThemedText variant="secondary" style={styles.examDescription} numberOfLines={2}>
                        {exam.description}
                      </ThemedText>
                    </ThemedView>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.viewAllButton}
                  onPress={() => router.push('/(tabs)/exams')}
                >
                  <ThemedText style={[styles.viewAllButtonText, { color: Colors[colorScheme].tint }]}>
                    View All Exams
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            ) : (
              <ThemedView
                variant="surface"
                style={styles.emptyState}
              >
                <ThemedText variant="secondary" style={styles.emptyStateText}>
                  No exams available at the moment.
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
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
  },
  examList: {
    marginBottom: 8,
  },
  examItem: {
    marginBottom: 8,
  },
  examCard: {
    padding: 16,
    borderRadius: 8,
  },
  examName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  examDescription: {
    fontSize: 14,
  },
  viewAllButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  viewAllButtonText: {
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 8,
  },
  emptyStateText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  startButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
