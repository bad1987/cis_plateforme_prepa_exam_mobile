import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import contentService, { Question, Subject } from '@/services/contentService';

export default function QuestionsScreen() {
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<Subject | null>(null);

  useEffect(() => {
    if (subjectId) {
      fetchQuestions(parseInt(subjectId));
    }
  }, [subjectId]);

  const fetchQuestions = async (id: number) => {
    try {
      setLoading(true);
      const data = await contentService.getQuestionsBySubject(id);
      setQuestions(data);
      
      // Get subject details to display the name
      // This is a simplified approach - in a real app, you might want to pass the subject name from the previous screen
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
        error instanceof Error ? error.message : 'Failed to load questions'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionPress = (questionId: number) => {
    router.push({
      pathname: '/questions/[questionId]' as any,
      params: { questionId }
    });
  };

  const renderQuestionItem = ({ item }: { item: Question }) => {
    // Create a preview of the question text (first 100 characters)
    const previewText = item.questionText.length > 100
      ? `${item.questionText.substring(0, 100)}...`
      : item.questionText;
    
    return (
      <TouchableOpacity
        style={styles.questionItem}
        onPress={() => handleQuestionPress(item.id)}
      >
        <ThemedView style={styles.questionCard}>
          <ThemedText style={styles.questionYear}>Year: {item.year}</ThemedText>
          <ThemedText style={styles.questionPreview}>{previewText}</ThemedText>
          <ThemedText style={styles.questionDifficulty}>
            Difficulty: {item.difficultyLevel}
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen options={{ 
        title: subject ? `${subject.name} Questions` : 'Questions',
        headerShown: true 
      }} />
      <ThemedView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
        ) : questions.length > 0 ? (
          <FlatList
            data={questions}
            renderItem={renderQuestionItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No questions available for this subject</ThemedText>
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
  listContainer: {
    paddingBottom: 20,
  },
  questionItem: {
    marginBottom: 16,
  },
  questionCard: {
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  questionYear: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  questionPreview: {
    marginBottom: 8,
  },
  questionDifficulty: {
    fontSize: 12,
    opacity: 0.7,
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
