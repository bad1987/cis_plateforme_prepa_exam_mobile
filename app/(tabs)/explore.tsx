import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { useState, useEffect } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Collapsible } from '@/components/Collapsible';
import { IconSymbol } from '@/components/ui/IconSymbol';
import contentService, { Subject } from '@/services/contentService';

// Study tips data
const studyTips = [
  {
    id: 1,
    title: 'Spaced Repetition',
    content: 'Instead of cramming, spread your studying over time. Review material at increasing intervals to improve long-term retention.'
  },
  {
    id: 2,
    title: 'Active Recall',
    content: 'Test yourself frequently. Instead of just re-reading notes, try to recall information from memory to strengthen neural connections.'
  },
  {
    id: 3,
    title: 'Pomodoro Technique',
    content: 'Study in focused 25-minute intervals with 5-minute breaks. After 4 intervals, take a longer 15-30 minute break.'
  },
  {
    id: 4,
    title: 'Teach What You Learn',
    content: 'Explaining concepts to others (or even to yourself) helps solidify your understanding and identify knowledge gaps.'
  },
  {
    id: 5,
    title: 'Use Multiple Resources',
    content: 'Don\'t rely on a single textbook or source. Diverse learning materials provide different perspectives and explanations.'
  }
];

export default function ResourcesScreen() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        // Get all exams
        const exams = await contentService.getExams();

        // Get subjects for the first exam (or you could get all subjects)
        if (exams.length > 0) {
          const subjectsData = await contentService.getSubjectsByExam(exams[0].id);
          setSubjects(subjectsData);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Study Resources', headerShown: true }} />
      <ScrollView style={styles.container}>
        <ThemedView style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>
            Study Resources
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Explore study materials, tips, and resources to help you prepare for your exams.
          </ThemedText>
        </ThemedView>

        {/* Study Tips Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.subSectionTitle}>
            Effective Study Techniques
          </ThemedText>

          {studyTips.map(tip => (
            <Collapsible key={tip.id} title={tip.title}>
              <ThemedText style={styles.tipContent}>
                {tip.content}
              </ThemedText>
            </Collapsible>
          ))}
        </ThemedView>

        {/* Subject Resources */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.subSectionTitle}>
            Subject Resources
          </ThemedText>

          {subjects.length > 0 ? (
            subjects.map(subject => (
              <ThemedView key={subject.id} style={styles.subjectItem}>
                <ThemedText style={styles.subjectName}>{subject.name}</ThemedText>
                <ThemedView style={styles.resourceButtons}>
                  <TouchableOpacity
                    style={styles.resourceButton}
                    onPress={() => router.push({
                      pathname: '/subjects/[subjectId]/notes' as any,
                      params: { subjectId: subject.id }
                    })}
                  >
                    <IconSymbol size={20} name="doc.text" color="#fff" />
                    <ThemedText style={styles.resourceButtonText}>Notes</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.resourceButton}
                    onPress={() => router.push({
                      pathname: '/subjects/[subjectId]/questions' as any,
                      params: { subjectId: subject.id }
                    })}
                  >
                    <IconSymbol size={20} name="questionmark.circle" color="#fff" />
                    <ThemedText style={styles.resourceButtonText}>Questions</ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.resourceButton, styles.quizButton]}
                    onPress={() => router.push({
                      pathname: '/quizzes/setup' as any,
                      params: { subjectId: subject.id }
                    })}
                  >
                    <IconSymbol size={20} name="pencil.and.scribble" color="#fff" />
                    <ThemedText style={styles.resourceButtonText}>Quiz</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            ))
          ) : (
            <ThemedView style={styles.emptyState}>
              <ThemedText style={styles.emptyStateText}>
                No subjects available. Check the Exams tab to browse available subjects.
              </ThemedText>
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push('/(tabs)/exams')}
              >
                <ThemedText style={styles.browseButtonText}>Browse Exams</ThemedText>
              </TouchableOpacity>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tipContent: {
    lineHeight: 22,
    marginBottom: 8,
  },
  subjectItem: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  resourceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resourceButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  quizButton: {
    backgroundColor: '#4CAF50',
  },
  resourceButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
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
  browseButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
