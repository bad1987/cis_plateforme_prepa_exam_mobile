import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, LayoutAnimation, Pressable } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
}

export function Collapsible({ title, children }: CollapsibleProps) {
  const [expanded, setExpanded] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';

  const toggleExpand = () => {
    LayoutAnimation.configureNext({
      duration: 200,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setExpanded(!expanded);
  };

  return (
    <ThemedView 
      variant="surface"
      style={[
        styles.container,
        { borderColor: Colors[colorScheme].border }
      ]}
    >
      <Pressable 
        style={({ pressed }) => [
          styles.titleContainer,
          expanded && [
            styles.expandedTitleContainer,
            { borderBottomColor: Colors[colorScheme].border }
          ],
          pressed && { backgroundColor: Colors[colorScheme].surfacePressed }
        ]} 
        onPress={toggleExpand}
      >
        <ThemedText style={styles.title}>{title}</ThemedText>
        <IconSymbol 
          size={20} 
          name={expanded ? "chevron.up" : "chevron.down"} 
          color={Colors[colorScheme].icon}
        />
      </Pressable>
      
      {expanded && (
        <ThemedView style={styles.content}>
          {children}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  expandedTitleContainer: {
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  content: {
    padding: 16,
  },
});
