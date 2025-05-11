import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { useState, useEffect } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Collapsible } from '@/components/Collapsible';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
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
  const colorScheme = useColorScheme() ?? 'light';

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
      <ScrollView>
        <ThemedView style={styles.container}>
          <ThemedView style={styles.section}>
            <ThemedText type="title" style={styles.sectionTitle}>
              Study Resources
            </ThemedText>
            <ThemedText variant="secondary" style={styles.sectionDescription}>
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
                <ThemedText variant="secondary" style={styles.tipContent}>
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
                <ThemedView 
                  key={subject.id} 
                  variant="surface"
                  style={[
                    styles.subjectItem,
                    { borderColor: Colors[colorScheme].border }
                  ]}
                >
                  <ThemedText style={styles.subjectName}>{subject.name}</ThemedText>
                  <ThemedView style={styles.resourceButtons}>
                    <TouchableOpacity
                      style={[styles.resourceButton, { backgroundColor: Colors[colorScheme].tint }]}
                      onPress={() => router.push({
                        pathname: '/subjects/[subjectId]/notes' as any,
                        params: { subjectId: subject.id }
                      })}
                    >
                      <IconSymbol size={20} name="doc.text" color={Colors[colorScheme === 'dark' ? 'dark' : 'light'].background} />
                      <ThemedText style={styles.resourceButtonText}>Notes</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.resourceButton, { backgroundColor: Colors[colorScheme].tint }]}
                      onPress={() => router.push({
                        pathname: '/subjects/[subjectId]/questions' as any,
                        params: { subjectId: subject.id }
                      })}
                    >
                      <IconSymbol size={20} name="questionmark.circle" color={Colors[colorScheme === 'dark' ? 'dark' : 'light'].background} />
                      <ThemedText style={styles.resourceButtonText}>Questions</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.resourceButton,
                        { backgroundColor: Colors[colorScheme].success }
                      ]}
                      onPress={() => router.push({
                        pathname: '/quizzes/setup' as any,
                        params: { subjectId: subject.id }
                      })}
                    >
                      <IconSymbol size={20} name="pencil.and.scribble" color={Colors[colorScheme === 'dark' ? 'dark' : 'light'].background} />
                      <ThemedText style={styles.resourceButtonText}>Quiz</ThemedText>
                    </TouchableOpacity>
                  </ThemedView>
                </ThemedView>
              ))
            ) : (
              <ThemedView 
                variant="surface"
                style={[
                  styles.emptyState,
                  { borderColor: Colors[colorScheme].border }
                ]}
              >
                <ThemedText variant="secondary" style={styles.emptyStateText}>
                  No subjects available. Check the Exams tab to browse available subjects.
                </ThemedText>
                <TouchableOpacity
                  style={[styles.browseButton, { backgroundColor: Colors[colorScheme].tint }]}
                  onPress={() => router.push('/(tabs)/exams')}
                >
                  <ThemedText style={styles.browseButtonText}>Browse Exams</ThemedText>
                </TouchableOpacity>
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.7,
    marginBottom: 24,
  },
  subSectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingTop: 8,
  },
  tipContent: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  subjectItem: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  subjectName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resourceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  resourceButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  quizButton: {
    // Removed the backgroundColor from here since it's applied dynamically
  },
  resourceButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 15,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyStateText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  browseButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  browseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
