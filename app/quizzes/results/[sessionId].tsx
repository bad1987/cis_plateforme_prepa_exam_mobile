import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { QuizGradeResponse, QuizQuestionResult } from '@/services/contentService';

export default function QuizResultsScreen() {
  const { sessionId, results: resultsParam } = useLocalSearchParams<{ 
    sessionId: string, 
    results: string 
  }>();
  
  const [results, setResults] = useState<QuizGradeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  const colorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    // Parse the results from the URL parameter
    if (resultsParam) {
      try {
        const parsedResults = JSON.parse(resultsParam);
        setResults(parsedResults);
      } catch (error) {
        Alert.alert('Error', 'Failed to parse results data');
      } finally {
        setLoading(false);
      }
    }
  }, [resultsParam]);

  const toggleQuestionExpand = (questionId: number) => {
    setExpandedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleGoHome = () => {
    router.push('/(tabs)');
  };

  const handleTakeAnotherQuiz = () => {
    router.push('/(tabs)/exams');
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Quiz Results',
          headerShown: true,
          headerLeft: () => null, // Disable back button
        }} 
      />
      <ThemedView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} style={styles.loader} />
        ) : results ? (
          <>
            <ThemedView 
              variant="surface"
              style={[
                styles.scoreCard,
                { backgroundColor: Colors[colorScheme].tint }
              ]}
            >
              <ThemedText type="title" style={styles.scoreTitle}>
                Your Score
              </ThemedText>
              <ThemedText style={styles.scoreText}>
                {results.score} / {results.totalQuestions}
              </ThemedText>
              <ThemedText style={styles.scorePercentage}>
                {Math.round((results.score / results.totalQuestions) * 100)}%
              </ThemedText>
            </ThemedView>
            
            <ThemedText type="subtitle" style={styles.resultsTitle}>
              Question Results
            </ThemedText>
            
            <ScrollView style={styles.scrollContainer}>
              {results.results.map((result: QuizQuestionResult) => (
                <ThemedView 
                  key={result.questionId} 
                  variant="surface"
                  style={[
                    styles.resultItem,
                    result.isCorrect ? styles.correctItem : styles.incorrectItem
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.resultHeader,
                      { backgroundColor: Colors[colorScheme].surfaceBackground }
                    ]}
                    onPress={() => toggleQuestionExpand(result.questionId)}
                  >
                    <ThemedText style={[
                      styles.resultStatus,
                      { color: result.isCorrect ? Colors[colorScheme].success : Colors[colorScheme].error }
                    ]}>
                      {result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </ThemedText>
                    <ThemedText style={styles.expandButton}>
                      {expandedQuestions.includes(result.questionId) ? '▼' : '▶'}
                    </ThemedText>
                  </TouchableOpacity>
                  
                  {expandedQuestions.includes(result.questionId) && (
                    <ThemedView 
                      variant="surface"
                      style={[
                        styles.resultDetails,
                        { borderTopColor: Colors[colorScheme].border }
                      ]}
                    >
                      <ThemedText style={styles.questionText}>
                        {result.question.questionText}
                      </ThemedText>
                      
                      <ThemedView style={styles.optionsContainer}>
                        {result.question.options.map((option) => (
                          <ThemedView
                            key={option.key}
                            style={[
                              styles.optionItem,
                              { 
                                borderColor: Colors[colorScheme].border,
                                backgroundColor: option.key === result.userAnswerKey
                                  ? 'rgba(244, 67, 54, 0.1)'
                                  : option.key === result.question.correctOptionKey
                                    ? 'rgba(76, 175, 80, 0.1)'
                                    : 'transparent'
                              }
                            ]}
                          >
                            <ThemedText style={styles.optionKey}>{option.key}.</ThemedText>
                            <ThemedText style={styles.optionText}>{option.text}</ThemedText>
                          </ThemedView>
                        ))}
                      </ThemedView>
                      
                      <ThemedView style={[
                        styles.explanationContainer,
                        { backgroundColor: Colors[colorScheme].surfaceBackground }
                      ]}>
                        <ThemedText style={styles.explanationTitle}>Explanation:</ThemedText>
                        <ThemedText style={styles.explanationText}>
                          {result.question.explanationText}
                        </ThemedText>
                      </ThemedView>
                    </ThemedView>
                  )}
                </ThemedView>
              ))}
            </ScrollView>
            
            <ThemedView style={styles.footer}>
              <TouchableOpacity
                style={[styles.homeButton, { backgroundColor: Colors[colorScheme].tint }]}
                onPress={handleGoHome}
              >
                <ThemedText style={styles.homeButtonText}>Go to Home</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.anotherQuizButton, { backgroundColor: Colors[colorScheme].success }]}
                onPress={handleTakeAnotherQuiz}
              >
                <ThemedText style={styles.anotherQuizButtonText}>Take Another Quiz</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </>
        ) : (
          <ThemedView 
            variant="surface"
            style={[
              styles.emptyContainer,
              { borderColor: Colors[colorScheme].border }
            ]}
          >
            <ThemedText variant="secondary" style={styles.emptyText}>Results not found</ThemedText>
            <TouchableOpacity 
              style={[styles.homeButton, { backgroundColor: Colors[colorScheme].tint }]}
              onPress={handleGoHome}
            >
              <ThemedText style={styles.homeButtonText}>Go to Home</ThemedText>
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
  scoreCard: {
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  scorePercentage: {
    fontSize: 18,
    color: '#fff',
  },
  resultsTitle: {
    marginBottom: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  resultItem: {
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  correctItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  incorrectItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  resultStatus: {
    fontWeight: 'bold',
  },
  expandButton: {
    fontSize: 16,
  },
  resultDetails: {
    padding: 16,
    borderTopWidth: 1,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 16,
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
  explanationContainer: {
    padding: 12,
    borderRadius: 4,
  },
  explanationTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  explanationText: {
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  homeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  anotherQuizButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  anotherQuizButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
});
