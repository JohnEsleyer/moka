
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { FileInfo } from 'expo-file-system';

interface NoteListProps {
  currentPath: string;
}

const NoteList: React.FC<NoteListProps> = ({ currentPath }) => {
  const [notes, setNotes] = useState<string[]>([]);

  const fetchNotes = async (path: string): Promise<void> => {
    try {
      const items: string[] = await FileSystem.readDirectoryAsync(path);
      const noteNames: string[] = [];

      for (const item of items) {
        const itemPath: string = `${path}${item}`;
        const info: FileInfo = await FileSystem.getInfoAsync(itemPath);
        // Check if it's a file and ends with .md
        if (!info.isDirectory && item.endsWith('.md')) {
          noteNames.push(item);
        }
      }
      setNotes(noteNames);
    } catch (error) {
      console.error('Failed to read notes:', error);
      Alert.alert('Error', 'Failed to read notes.');
    }
  };

  useEffect(() => {
    fetchNotes(currentPath);
  }, [currentPath]);

  const renderNoteItem = ({ item }: { item: string }) => (
    <TouchableOpacity style={styles.noteItem}>
      <Text style={styles.noteText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={renderNoteItem}
        keyExtractor={item => item}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  noteItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  noteText: {
    fontSize: 16,
  },
});

export default NoteList;