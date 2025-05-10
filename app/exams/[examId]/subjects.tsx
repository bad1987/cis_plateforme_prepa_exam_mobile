import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import contentService, { Subject } from '@/services/contentService';

export default function SubjectsScreen() {
  const { examId } = useLocalSearchParams<{ examId: string }>();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [examName, setExamName] = useState('');

  useEffect(() => {
    if (examId) {
      fetchSubjects(parseInt(examId));
    }
  }, [examId]);

  const fetchSubjects = async (id: number) => {
    try {
      setLoading(true);
      const data = await contentService.getSubjectsByExam(id);
      setSubjects(data);
      
      // Get exam details to display the name
      const exams = await contentService.getExams();
      const exam = exams.find(e => e.id === id);
      if (exam) {
        setExamName(exam.name);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to load subjects'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectPress = (subjectId: number, subjectName: string) => {
    // Show action sheet to choose between questions or notes
    Alert.alert(
      `${subjectName}`,
      'What would you like to view?',
      [
        {
          text: 'Questions',
          onPress: () => router.push({
            pathname: '/subjects/[subjectId]/questions' as any,
            params: { subjectId }
          })
        },
        {
          text: 'Notes',
          onPress: () => router.push({
            pathname: '/subjects/[subjectId]/notes' as any,
            params: { subjectId }
          })
        },
        {
          text: 'Take Quiz',
          onPress: () => router.push({
            pathname: '/quizzes/setup' as any,
            params: { subjectId }
          })
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const renderSubjectItem = ({ item }: { item: Subject }) => (
    <TouchableOpacity
      style={styles.subjectItem}
      onPress={() => handleSubjectPress(item.id, item.name)}
    >
      <ThemedView style={styles.subjectCard}>
        <ThemedText type="subtitle" style={styles.subjectName}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.subjectDescription}>
          {item.description}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ 
        title: examName || 'Subjects',
        headerShown: true 
      }} />
      <ThemedView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
        ) : subjects.length > 0 ? (
          <FlatList
            data={subjects}
            renderItem={renderSubjectItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No subjects available for this exam</ThemedText>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <ThemedText style={styles.backButtonText}>Back to Exams</ThemedText>
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
  subjectItem: {
    marginBottom: 16,
  },
  subjectCard: {
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subjectDescription: {
    marginBottom: 8,
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
