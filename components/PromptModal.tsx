import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';

interface PromptModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: (text: string, fileExtension?: 'md' | 'html') => void; // Updated line
  onCancel: () => void;
  isNoteCreation?: boolean;
}

const PromptModal: React.FC<PromptModalProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  isNoteCreation = false, // Default to false
}) => {
  const [inputText, setInputText] = useState('');
  const [fileExtension, setFileExtension] = useState<'md' | 'html'>('md'); // New state for file extension

  const handleConfirm = () => {
    if (isNoteCreation) {
      onConfirm(inputText, fileExtension);
    } else {
      onConfirm(inputText);
    }
    setInputText('');
    setFileExtension('md'); // Reset extension on close
  };

  const handleCancel = () => {
    onCancel();
    setInputText('');
    setFileExtension('md'); // Reset extension on close
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleCancel}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{message}</Text>
          <TextInput
            style={styles.input}
            onChangeText={setInputText}
            value={inputText}
            autoFocus={true} 
            placeholder="Enter name"
          />

          {isNoteCreation && (
            <View style={styles.extensionContainer}>
              <TouchableOpacity
                style={[styles.extensionButton, fileExtension === 'md' && styles.extensionButtonActive]}
                onPress={() => setFileExtension('md')}
              >
                <Text style={[styles.extensionText, fileExtension === 'md' && styles.extensionTextActive]}>.md</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.extensionButton, fileExtension === 'html' && styles.extensionButtonActive]}
                onPress={() => setFileExtension('html')}
              >
                <Text style={[styles.extensionText, fileExtension === 'html' && styles.extensionTextActive]}>.html</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={handleCancel} color="#888" />
            <Button title="Create" onPress={handleConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  extensionContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  extensionButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 5,
  },
  extensionButtonActive: {
    backgroundColor: '#007AFF', // A different color for active state
    borderColor: '#007AFF',
  },
  extensionText: {
    color: '#000',
    fontWeight: 'bold',
  },
  extensionTextActive: {
    color: '#fff',
  },
});

export default PromptModal;