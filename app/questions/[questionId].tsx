import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import contentService, { Question } from '@/services/contentService';

export default function QuestionDetailScreen() {
  const { questionId } = useLocalSearchParams<{ questionId: string }>();
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    if (questionId) {
      fetchQuestion(parseInt(questionId));
    }
  }, [questionId]);

  const fetchQuestion = async (id: number) => {
    try {
      setLoading(true);
      const data = await contentService.getQuestion(id);
      setQuestion(data);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to load question'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  return (
    <>
      <Stack.Screen options={{
        title: 'Question Details',
        headerShown: true
      }} />
      <ThemedView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
        ) : question ? (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <ThemedView style={styles.questionCard}>
              <ThemedText style={styles.questionMeta}>
                Year: {question.year} | Difficulty: {question.difficultyLevel}
              </ThemedText>

              <ThemedText style={styles.questionText}>
                {question.questionText}
              </ThemedText>

              <ThemedView style={styles.optionsContainer}>
                <ThemedText style={styles.optionsTitle}>Options:</ThemedText>
                {question.options && question.options.length > 0 ? (
                  question.options.map((option) => (
                    <ThemedView
                      key={option.key}
                      style={[
                        styles.optionItem,
                        showExplanation && option.key === question.correctOptionKey && styles.correctOption
                      ]}
                    >
                      <ThemedText style={styles.optionKey}>{option.key}.</ThemedText>
                      <ThemedText style={styles.optionText}>{option.text}</ThemedText>
                    </ThemedView>
                  ))
                ) : (
                  <ThemedView style={styles.noOptionsContainer}>
                    <ThemedText style={styles.noOptionsText}>
                      No options available for this question.
                    </ThemedText>
                  </ThemedView>
                )}
              </ThemedView>

              <TouchableOpacity
                style={styles.explanationButton}
                onPress={toggleExplanation}
              >
                <ThemedText style={styles.explanationButtonText}>
                  {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                </ThemedText>
              </TouchableOpacity>

              {showExplanation && (
                <ThemedView style={styles.explanationContainer}>
                  <ThemedText style={styles.explanationTitle}>Explanation:</ThemedText>
                  <ThemedText style={styles.explanationText}>
                    {question.explanationText}
                  </ThemedText>
                  <ThemedText style={styles.correctAnswerText}>
                    Correct Answer: {question.correctOptionKey}
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ThemedText style={styles.backButtonText}>Back to Questions</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>Question not found</ThemedText>
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
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  questionCard: {
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  questionMeta: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  optionItem: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 8,
  },
  correctOption: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4CAF50',
  },
  optionKey: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  optionText: {
    flex: 1,
  },
  explanationButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    alignSelf: 'center',
  },
  explanationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  explanationContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.2)',
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  explanationText: {
    marginBottom: 12,
    lineHeight: 22,
  },
  correctAnswerText: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  backButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    alignSelf: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
  noOptionsContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  noOptionsText: {
    fontSize: 16,
    color: '#666',
  },
});
