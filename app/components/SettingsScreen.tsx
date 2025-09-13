import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { API_KEY_FILE, notesDirectoryURI } from '../utils/constants';
import { readNote, saveNote } from '../utils/fileSystem';

const SettingsScreen = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const key = await readNote(API_KEY_FILE);
        setApiKey(key);
      } catch (error) {
        console.error('Failed to load API key:', error);
      }
    };
    loadApiKey();
  }, []);

  const debouncedSave = (newKey: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    // The fix is here. The type is now correctly handled.
    debounceTimeout.current = setTimeout(async () => {
      try {
        await saveNote(API_KEY_FILE, newKey);
        console.log('API key saved successfully.');
      } catch (error) {
        console.error('Failed to save API key:', error);
      }
    }, 500) as unknown as NodeJS.Timeout;
  };

  const handleApiKeyChange = (text: string) => {
    setApiKey(text);
    debouncedSave(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <Text style={styles.label}>Google Gemini API Key:</Text>
      <TextInput
        style={styles.input}
        value={apiKey}
        onChangeText={handleApiKeyChange}
        placeholder="Enter your API key here..."
        placeholderTextColor="#888"
        autoCapitalize="none"
        secureTextEntry={false}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Local Storage</Text>
        <Text style={styles.storageText}>
          Your notes are stored locally in the following directory:
        </Text>
       <Text style={styles.pathText}>{notesDirectoryURI}</Text>
      </View>

      <Text style={styles.text}>This is the settings page. More options coming soon!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    marginBottom: 20,
  },
  section: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#e9e9e9',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  storageText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  pathText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#000',
    fontWeight: 'bold',
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginTop: 10,
  },
});

export default SettingsScreen;