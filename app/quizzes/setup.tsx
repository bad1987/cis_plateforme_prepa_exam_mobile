import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import contentService, { Subject } from '@/services/contentService';

export default function QuizSetupScreen() {
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingQuiz, setStartingQuiz] = useState(false);
  const [numberOfQuestions, setNumberOfQuestions] = useState('10');

  useEffect(() => {
    if (subjectId) {
      fetchSubjectDetails(parseInt(subjectId));
    }
  }, [subjectId]);

  const fetchSubjectDetails = async (id: number) => {
    try {
      setLoading(true);
      // Get subject details to display the name
      const exams = await contentService.getExams();
      for (const exam of exams) {
        const subjects = await contentService.getSubjectsByExam(exam.id);
        const foundSubject = subjects.find(s => s.id === id);
        if (foundSubject) {
          setSubject(foundSubject);
          break;
        }
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to load subject details'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    if (!subjectId) {
      Alert.alert('Error', 'Subject ID is required');
      return;
    }

    const numQuestions = parseInt(numberOfQuestions);
    if (isNaN(numQuestions) || numQuestions <= 0) {
      Alert.alert('Error', 'Please enter a valid number of questions');
      return;
    }

    try {
      setStartingQuiz(true);
      const quizData = await contentService.startQuiz({
        subjectId: parseInt(subjectId),
        numberOfQuestions: numQuestions
      });

      // Navigate to the quiz screen with the session data
      router.push({
        pathname: '/quizzes/[sessionId]' as any,
        params: { 
          sessionId: quizData.sessionId.toString(),
          // Pass the questions as a stringified JSON to avoid URL length limitations
          // In a real app, you might want to use a state management solution like Redux or Context
          questions: JSON.stringify(quizData.questions)
        }
      });
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to start quiz'
      );
    } finally {
      setStartingQuiz(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Quiz Setup',
        headerShown: true 
      }} />
      <ThemedView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
        ) : subject ? (
          <ThemedView style={styles.setupCard}>
            <ThemedText type="title" style={styles.title}>
              Start a Quiz
            </ThemedText>
            
            <ThemedText style={styles.subjectName}>
              Subject: {subject.name}
            </ThemedText>
            
            <ThemedView style={styles.inputContainer}>
              <ThemedText style={styles.label}>Number of Questions:</ThemedText>
              <TextInput
                style={styles.input}
                value={numberOfQuestions}
                onChangeText={setNumberOfQuestions}
                keyboardType="numeric"
                placeholder="Enter number of questions"
              />
            </ThemedView>
            
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartQuiz}
              disabled={startingQuiz}
            >
              {startingQuiz ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.startButtonText}>Start Quiz</ThemedText>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => router.back()}
              disabled={startingQuiz}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>Subject not found</ThemedText>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <ThemedText style={styles.backButtonText}>Back</ThemedText>
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
    justifyContent: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setupCard: {
    padding: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subjectName: {
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
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
  backButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
