import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { saveNote, readNote } from '../utils/fileSystem'; 
import { ArrowLeft } from 'lucide-react-native'; 

interface NoteContentProps {
  noteTitle: string;
  onGoBack: () => void;
}

const NoteContent: React.FC<NoteContentProps> = ({ noteTitle, onGoBack }) => {
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    const loadNote = async () => {
      const content = await readNote(noteTitle);
      setNoteContent(content);
    };

    if (noteTitle) {
      loadNote();
    }
  }, [noteTitle]);

  const handleSave = async (text: string) => {
    await saveNote(noteTitle, text);
    setNoteContent(text); 
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{noteTitle}</Text>
      </View>
      <ScrollView style={styles.contentContainer}>
        <TextInput
          style={styles.textInput}
          multiline
          value={noteContent}
          onChangeText={handleSave}
          textAlignVertical="top" 
          placeholder="Start writing..."
          placeholderTextColor="#888"
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 15,
  },
  textInput: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
});

export default NoteContent;