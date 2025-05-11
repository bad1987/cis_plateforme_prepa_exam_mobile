import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, BackHandler } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import contentService, { Question, QuizAnswer } from '@/services/contentService';

export default function QuizScreen() {
  const { sessionId, questions: questionsParam } = useLocalSearchParams<{
    sessionId: string,
    questions: string
  }>();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<QuizAnswer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // Time in seconds
  const [timerActive, setTimerActive] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    // Parse the questions from the URL parameter
    if (questionsParam) {
      try {
        const parsedQuestions = JSON.parse(questionsParam);
        setQuestions(parsedQuestions);

        // Initialize user answers array with empty answers
        const initialAnswers = parsedQuestions.map((q: Question) => ({
          questionId: q.id,
          userAnswerKey: ''
        }));
        setUserAnswers(initialAnswers);

        // Set up a timer (e.g., 60 seconds per question)
        const totalTime = parsedQuestions.length * 60;
        setTimeLeft(totalTime);
        setTimerActive(true);
      } catch (error) {
        Alert.alert('Error', 'Failed to parse questions data');
      }
    }

    // Handle back button to prevent accidental quiz exit
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      confirmExitQuiz();
      return true; // Prevent default behavior
    });

    return () => {
      backHandler.remove();
    };
  }, [questionsParam]);

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      // Time's up, submit the quiz
      Alert.alert('Time\'s Up!', 'Your quiz will be submitted now.');
      handleSubmitQuiz();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleSelectAnswer = (questionId: number, optionKey: string) => {
    setUserAnswers(prev =>
      prev.map(answer =>
        answer.questionId === questionId
          ? { ...answer, userAnswerKey: optionKey }
          : answer
      )
    );
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const confirmExitQuiz = () => {
    Alert.alert(
      'Exit Quiz?',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => router.back() }
      ]
    );
  };

  const handleSubmitQuiz = async () => {
    if (!sessionId) {
      Alert.alert('Error', 'Session ID is required');
      return;
    }

    // Confirm submission
    Alert.alert(
      'Submit Quiz?',
      'Are you sure you want to submit your answers?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              setSubmitting(true);
              setTimerActive(false);

              const gradeData = await contentService.gradeQuiz({
                sessionId: parseInt(sessionId),
                answers: userAnswers
              });

              // Navigate to results screen
              router.replace({
                pathname: '/quizzes/results/[sessionId]' as any,
                params: {
                  sessionId: sessionId,
                  results: JSON.stringify(gradeData)
                }
              });
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to submit quiz'
              );
              setSubmitting(false);
              setTimerActive(true);
            }
          }
        }
      ]
    );
  };

  // Current question being displayed
  const currentQuestion = questions[currentQuestionIndex];

  // Get the user's answer for the current question
  const currentAnswer = userAnswers.find(
    answer => currentQuestion && answer.questionId === currentQuestion.id
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Quiz',
          headerShown: true,
          headerLeft: () => null, // Disable back button
        }}
      />
      <ThemedView style={styles.container}>
        {questions.length > 0 && currentQuestion ? (
          <>
            <ThemedView style={styles.header}>
              <ThemedView style={styles.progressContainer}>
                <ThemedText variant="secondary" style={styles.progressText}>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </ThemedText>
                <ThemedView 
                  variant="surface"
                  style={[
                    styles.progressBar,
                    { backgroundColor: Colors[colorScheme].surfaceBackground }
                  ]}
                >
                  <ThemedView
                    style={[
                      styles.progressFill,
                      { 
                        width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                        backgroundColor: Colors[colorScheme].success
                      }
                    ]}
                  />
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.timerContainer}>
                <ThemedText style={[
                  styles.timerText,
                  timeLeft < 60 && { color: Colors[colorScheme].error }
                ]}>
                  Time: {formatTime(timeLeft)}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ScrollView style={styles.scrollContainer}>
              <ThemedView 
                variant="surface"
                style={[
                  styles.questionCard,
                  { borderColor: Colors[colorScheme].border }
                ]}
              >
                <ThemedText style={styles.questionText}>
                  {currentQuestion.questionText}
                </ThemedText>

                <ThemedView style={styles.optionsContainer}>
                  {currentQuestion.options && currentQuestion.options.length > 0 ? (
                    currentQuestion.options.map((option) => (
                      <TouchableOpacity
                        key={option.key}
                        style={[
                          styles.optionItem,
                          { 
                            borderColor: Colors[colorScheme].border,
                            backgroundColor: currentAnswer?.userAnswerKey === option.key 
                              ? Colors[colorScheme].surfacePressed
                              : 'transparent'
                          }
                        ]}
                        onPress={() => handleSelectAnswer(currentQuestion.id, option.key)}
                        disabled={submitting}
                      >
                        <ThemedText style={styles.optionKey}>{option.key}.</ThemedText>
                        <ThemedText style={styles.optionText}>{option.text}</ThemedText>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <ThemedView 
                      variant="surface"
                      style={[
                        styles.noOptionsContainer,
                        { backgroundColor: Colors[colorScheme].surfaceBackground }
                      ]}
                    >
                      <ThemedText variant="secondary" style={styles.noOptionsText}>
                        No options available for this question.
                      </ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>
              </ThemedView>
            </ScrollView>

            <ThemedView style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  { backgroundColor: Colors[colorScheme].tint },
                  currentQuestionIndex === 0 && styles.disabledButton
                ]}
                onPress={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0 || submitting}
              >
                <ThemedText style={styles.navButtonText}>Previous</ThemedText>
              </TouchableOpacity>

              {currentQuestionIndex === questions.length - 1 ? (
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    { backgroundColor: Colors[colorScheme].success },
                    submitting && styles.disabledButton
                  ]}
                  onPress={handleSubmitQuiz}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText style={styles.submitButtonText}>Submit</ThemedText>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.navButton,
                    { backgroundColor: Colors[colorScheme].tint }
                  ]}
                  onPress={handleNextQuestion}
                  disabled={submitting}
                >
                  <ThemedText style={styles.navButtonText}>Next</ThemedText>
                </TouchableOpacity>
              )}
            </ThemedView>
          </>
        ) : (
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} style={styles.loader} />
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
  header: {
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  timerContainer: {
    alignItems: 'flex-end',
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  questionCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 8,
  },
  optionKey: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  optionText: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  noOptionsContainer: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  noOptionsText: {
    fontSize: 16,
  },
});
