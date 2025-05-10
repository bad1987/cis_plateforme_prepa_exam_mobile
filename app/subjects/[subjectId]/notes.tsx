import { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import contentService, { Note, Subject } from '@/services/contentService';

export default function NotesScreen() {
  const { subjectId } = useLocalSearchParams<{ subjectId: string }>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<Subject | null>(null);

  useEffect(() => {
    if (subjectId) {
      fetchNotes(parseInt(subjectId));
    }
  }, [subjectId]);

  const fetchNotes = async (id: number) => {
    try {
      setLoading(true);
      const data = await contentService.getNotesBySubject(id);
      setNotes(data);
      
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
        error instanceof Error ? error.message : 'Failed to load notes'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNotePress = (noteId: number) => {
    router.push({
      pathname: '/notes/[noteId]' as any,
      params: { noteId }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderNoteItem = ({ item }: { item: Note }) => {
    // Create a preview of the note content (first 100 characters)
    const previewText = item.content.length > 100
      ? `${item.content.substring(0, 100)}...`
      : item.content;
    
    return (
      <TouchableOpacity
        style={styles.noteItem}
        onPress={() => handleNotePress(item.id)}
      >
        <ThemedView style={styles.noteCard}>
          <ThemedText type="subtitle" style={styles.noteTitle}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.notePreview}>{previewText}</ThemedText>
          <ThemedText style={styles.noteDate}>
            Updated: {formatDate(item.updatedAt)}
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen options={{ 
        title: subject ? `${subject.name} Notes` : 'Notes',
        headerShown: true 
      }} />
      <ThemedView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
        ) : notes.length > 0 ? (
          <FlatList
            data={notes}
            renderItem={renderNoteItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No notes available for this subject</ThemedText>
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
  noteItem: {
    marginBottom: 16,
  },
  noteCard: {
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notePreview: {
    marginBottom: 8,
  },
  noteDate: {
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
