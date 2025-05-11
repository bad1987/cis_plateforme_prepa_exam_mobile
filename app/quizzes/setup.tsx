import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import contentService, { Subject } from '@/services/contentService';

export default function QuizSetupScreen() {
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingQuiz, setStartingQuiz] = useState(false);
  const [numberOfQuestions, setNumberOfQuestions] = useState('10');
  const colorScheme = useColorScheme() ?? 'light';

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
    if (!subject) return;

    const numQuestions = parseInt(numberOfQuestions);
    if (isNaN(numQuestions) || numQuestions < 1) {
      Alert.alert('Error', 'Please enter a valid number of questions');
      return;
    }

    try {
      setStartingQuiz(true);
      const quizData = await contentService.setupQuiz(subject.id, numQuestions);
      
      router.push({
        pathname: '/quizzes/[sessionId]' as any,
        params: {
          sessionId: quizData.sessionId,
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
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} style={styles.loader} />
        ) : subject ? (
          <ThemedView 
            variant="surface"
            style={[
              styles.setupCard,
              { borderColor: Colors[colorScheme].border }
            ]}
          >
            <ThemedText type="title" style={styles.title}>
              Start a Quiz
            </ThemedText>
            
            <ThemedText variant="secondary" style={styles.subjectName}>
              Subject: {subject.name}
            </ThemedText>
            
            <ThemedView style={styles.inputContainer}>
              <ThemedText variant="secondary" style={styles.label}>Number of Questions:</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: Colors[colorScheme].text,
                    backgroundColor: Colors[colorScheme].surfaceBackground,
                    borderColor: Colors[colorScheme].border
                  }
                ]}
                value={numberOfQuestions}
                onChangeText={setNumberOfQuestions}
                keyboardType="numeric"
                placeholder="Enter number of questions"
                placeholderTextColor={Colors[colorScheme].icon}
              />
            </ThemedView>
            
            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: Colors[colorScheme].success }]}
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
              style={[
                styles.cancelButton,
                { 
                  borderColor: Colors[colorScheme].border,
                  backgroundColor: Colors[colorScheme].surfaceBackground
                }
              ]} 
              onPress={() => router.back()}
              disabled={startingQuiz}
            >
              <ThemedText variant="secondary" style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <ThemedView 
            variant="surface"
            style={[
              styles.emptyContainer,
              { borderColor: Colors[colorScheme].border }
            ]}
          >
            <ThemedText variant="secondary" style={styles.emptyText}>Subject not found</ThemedText>
            <TouchableOpacity 
              style={[styles.backButton, { backgroundColor: Colors[colorScheme].tint }]}
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
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  startButton: {
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
  },
  cancelButtonText: {
    fontSize: 16,
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
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
