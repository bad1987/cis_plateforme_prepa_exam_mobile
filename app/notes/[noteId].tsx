import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import Markdown from 'react-native-markdown-display';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import contentService, { Note } from '@/services/contentService';

export default function NoteDetailScreen() {
  const { noteId } = useLocalSearchParams<{ noteId: string }>();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (noteId) {
      fetchNote(parseInt(noteId));
    }
  }, [noteId]);

  const fetchNote = async (id: number) => {
    try {
      setLoading(true);
      const data = await contentService.getNote(id);
      setNote(data);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to load note'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <>
      <Stack.Screen options={{ 
        title: note ? note.title : 'Note',
        headerShown: true 
      }} />
      <ThemedView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
        ) : note ? (
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <ThemedView style={styles.noteCard}>
              <ThemedText type="title" style={styles.noteTitle}>
                {note.title}
              </ThemedText>
              
              <ThemedText style={styles.noteMeta}>
                Last Updated: {formatDate(note.updatedAt)}
              </ThemedText>
              
              <ThemedView style={styles.contentContainer}>
                <Markdown style={markdownStyles}>
                  {note.content}
                </Markdown>
              </ThemedView>
            </ThemedView>
            
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
            >
              <ThemedText style={styles.backButtonText}>Back to Notes</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>Note not found</ThemedText>
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
  noteCard: {
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  noteTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noteMeta: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  contentContainer: {
    marginTop: 8,
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
});

// Markdown styles
const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  heading1: {
    fontSize: 24,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  heading2: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  heading3: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  paragraph: {
    marginBottom: 16,
  },
  list_item: {
    marginBottom: 8,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    paddingLeft: 8,
    marginLeft: 8,
    marginVertical: 8,
    fontStyle: 'italic',
  },
  code_block: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 4,
    fontFamily: 'monospace',
    marginVertical: 8,
  },
  code_inline: {
    backgroundColor: '#f5f5f5',
    fontFamily: 'monospace',
    padding: 4,
    borderRadius: 2,
  },
  link: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginVertical: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 8,
  },
  tr: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  th: {
    padding: 8,
    fontWeight: 'bold',
    backgroundColor: '#f5f5f5',
  },
  td: {
    padding: 8,
  },
};
