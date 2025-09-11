import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import Markdown from 'react-native-markdown-display';
import { saveNote, readNote } from '../utils/fileSystem'; 
import { ArrowLeft } from 'lucide-react-native'; 
import CodeEditor, { CodeEditorSyntaxStyles } from '@rivascva/react-native-code-editor';

interface NoteContentProps {
  noteTitle: string;
  onGoBack: () => void;
  onRenameNote: (oldTitle: string, newTitle: string) => void;
}

const NoteContent: React.FC<NoteContentProps> = ({ noteTitle, onGoBack, onRenameNote }) => {
  const [noteContent, setNoteContent] = useState('');
  const [editableTitle, setEditableTitle] = useState(noteTitle);
  const [isMarkdownPreviewMode, setIsMarkdownPreviewMode] = useState(true);
  const fileExtension = noteTitle.split('.').pop();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const debounce = (func: (...args: any[]) => void, delay: number) => {
    return (...args: any[]) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => func(...args), delay);
    };
  };

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
    setNoteContent(text); 
    await saveNote(editableTitle, text);
  };

  const debouncedRename = debounce((newTitle: string) => {
    if (newTitle && newTitle.trim().length > 0 && newTitle !== noteTitle) {
      onRenameNote(noteTitle, newTitle);
    }
  }, 500);

  const handleTitleChange = (text: string) => {
    setEditableTitle(text);
    debouncedRename(text);
  };

  const toggleMode = () => {
    setIsMarkdownPreviewMode(!isMarkdownPreviewMode);
  };

  const renderContent = () => {
    if (!isMarkdownPreviewMode) {
      if (fileExtension === 'html') {
        return (
          <CodeEditor
            style={styles.codeEditor}
            initialValue={noteContent}
            onChange={handleSave}
            language="xml"
            syntaxStyle={CodeEditorSyntaxStyles.atomOneDark}
            showLineNumbers
          />
        );
      }

      // Default to TextInput for other file types in edit mode
      return (
        <TextInput 
          style={styles.textInput}
          multiline 
          value={noteContent}
          onChangeText={handleSave}
          textAlignVertical="top"
          placeholder="Start writing..."
          placeholderTextColor="#888"
        />
      );
    }

    // Preview Mode
    if (fileExtension === 'md') {
      return (
        <ScrollView style={styles.contentContainer}>
          <Markdown style={markdownStyles}>
            {noteContent}
          </Markdown>
        </ScrollView>
      );
    }

    if (fileExtension === 'html') {
      return (
        <WebView
          originWhitelist={['*']}
          source={{ html: noteContent }}
          style={styles.webView}
        />
      );
    }

    // Default case for any other file types in preview mode
    return (
      <TextInput 
        style={styles.textInput}
        multiline 
        value={noteContent}
        onChangeText={handleSave}
        textAlignVertical="top"
        placeholder="Start writing..."
        placeholderTextColor="#888"
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <TextInput
          style={styles.titleInput} 
          value={editableTitle}
          onChangeText={handleTitleChange}
          placeholder="Note Title"
        />
        <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
          <Text style={styles.toggleButtonText}>
            {isMarkdownPreviewMode ? 'Edit' : 'Preview'}
          </Text>
        </TouchableOpacity>
      </View>
      {renderContent()}
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
  titleInput: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  toggleButton: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
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
  webView: {
    flex: 1,
    backgroundColor: '#fff'
  },
  codeEditor: {
    flex: 1,
    padding: 15,
    fontSize: 14,
  }
});

const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 16,
    color: '#000',
  },
  heading1: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  heading2: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  link: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  list_item: {
    fontSize: 16,
  },
  code_inline: {
    backgroundColor: '#f0f0f0',
    padding: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  blockquote: {
    borderLeftColor: '#ccc',
    borderLeftWidth: 4,
    paddingLeft: 10,
    marginLeft: 10,
    fontStyle: 'italic',
  },
});

export default NoteContent;