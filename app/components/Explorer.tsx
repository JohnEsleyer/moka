import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainerRef, useFocusEffect } from '@react-navigation/native';
import { Directory, File, Paths } from 'expo-file-system';
import { Cog, FolderPlus, StickyNote } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import ConfirmationModal from './ConfirmationModal';
import FloatingButton from './FloatingButton';
import FoldersScreen from './FoldersScreen';
import NoteContent from './NoteContent';
import NoteList from './NoteList';
import PromptModal from './PromptModal';
import SettingsScreen from './SettingsScreen';

const Tab = createMaterialTopTabNavigator();

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  onPress: () => void;
}

interface DirectoryContent {
  folders: string[];
  files: string[];
}

const notesDirectory = new Directory(Paths.document, 'notes');

const Explorer = () => {
  const [directoryContent, setDirectoryContent] = useState<DirectoryContent>({
    folders: [],
    files: [],
  });
  const [currentDirectory, setCurrentDirectory] = useState<Directory>(notesDirectory);
  const [activeTab, setActiveTab] = useState<string>('Folders');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'folder' | 'file' | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<{ name: string, type: 'folder' | 'file' } | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null); 
  const [showSettingsButton, setShowSettingsButton] = useState<boolean>(true);

  const settingsMenu = [
    { id: '1', icon: <Cog />, onPress: () => navigationRef.current?.navigate('Settings') }
  ];

  const navigationRef = useRef<NavigationContainerRef<any | null>>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleRenameNote = async (oldTitle: string, newTitle: string) => {
    try {
      const oldFile = new File(currentDirectory, oldTitle);
      const newFile = new File(currentDirectory, newTitle);

      const content = await oldFile.text();
      
      await oldFile.delete();
      await newFile.write(content);

      setSelectedNote(newTitle);
      listItems();
    } catch (error) {
      console.error('Failed to rename note:', error);
      Alert.alert('Error', 'Failed to rename note');
      setSelectedNote(oldTitle);
    }
  };

const listItems = async () => {
  setIsLoading(true);
  const newDirectoryContent: DirectoryContent = { folders: [], files: [] };
  try {
    await currentDirectory.create({ intermediates: true });
    const items = await currentDirectory.list();
    for (const item of items) {
      if (item instanceof Directory) {
        newDirectoryContent.folders.push(item.name);
      } else if (item instanceof File) {
        newDirectoryContent.files.push(item.name);
      }
    }
    setDirectoryContent(newDirectoryContent);
  } catch (error) {
    console.error("Failed to list items:", error);
    Alert.alert('Error', 'Failed to read directory contents.');
    setDirectoryContent({ folders: [], files: [] });
  } finally {
    setIsLoading(false);
  }
};

  const navigateToFolder = (folderName: string) => {
    const newDirectory = new Directory(currentDirectory, folderName);
    setCurrentDirectory(newDirectory);
  };

  const goBack = () => {
    if (currentDirectory.uri !== notesDirectory.uri) {
      const parentDirectory = currentDirectory.parentDirectory;
      if (parentDirectory) {
        setCurrentDirectory(parentDirectory);
      }
    }
  };

  const handleCreateFolder = () => {
    setModalType('folder');
    setModalVisible(true);
  };

  const handleCreateFile = () => {
    setModalType('file');
    setModalVisible(true);
  };

  const handleModalConfirm = async (name: string, fileExtension?: 'md' | 'html') => {
    if (name && name.trim().length > 0) {
      try {
        if (modalType === 'folder') {
          const newFolder = new Directory(currentDirectory, name);
          const dirInfo = await newFolder.info();
          if (dirInfo.exists) {
            Alert.alert("Error", `A folder named "${name}" already exists.`);
            return;
          }
          await newFolder.create();
        } else if (modalType === 'file') {
          const finalExtension = fileExtension || 'md'; 
          const fileNameWithExtension = name.endsWith(`.${finalExtension}`) ? name : `${name}.${finalExtension}`;
          const newFile = new File(currentDirectory, fileNameWithExtension);
          const fileInfo = await newFile.info();
          if (fileInfo.exists) {
            Alert.alert("Error", `A file named "${fileNameWithExtension}" already exists.`);
            return;
          }
          await newFile.write('');
          setSelectedNote(fileNameWithExtension);
        }
        listItems();
      } catch (error) {
        Alert.alert("Error", `Failed to create: ${error}`);
      }
    }
    setModalVisible(false);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handlePrepareDelete = (name: string, type: 'folder' | 'file') => {
    setItemToDelete({ name, type });
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === 'folder') {
        const folder = new Directory(currentDirectory, itemToDelete.name);
        await folder.delete();
      } else {
        const file = new File(currentDirectory, itemToDelete.name);
        await file.delete();
      }
      listItems();
      if (selectedNote === itemToDelete.name) {
        setSelectedNote(null);
      }
    } catch (error) {
      Alert.alert("Error", `Failed to delete: ${error}`);
    } finally {
      setDeleteModalVisible(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const handleNotePress = (fileName: string) => {
    setSelectedNote(fileName);
  };

  useEffect(() => {
    listItems();
  }, [currentDirectory.uri]);

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#000',
          tabBarInactiveTintColor: '#888',
          tabBarLabelStyle: { fontSize: 16, fontWeight: 'bold', padding: 2, paddingTop: 12 },
          tabBarStyle: { backgroundColor: '#fff' },
          tabBarIndicatorStyle: { backgroundColor: '#000' },
        }}
      >
        <Tab.Screen name="Folders" options={{ title: 'Folders' }}>
          {() => {
            useFocusEffect(
              React.useCallback(() => {
                setActiveTab('Folders');
              }, [])
            );
            return (
              <FoldersScreen
                folders={directoryContent.folders}
                isRoot={currentDirectory.uri === notesDirectory.uri}
                onFolderPress={navigateToFolder}
                onGoBack={goBack}
                onFolderDelete={(name) => handlePrepareDelete(name, 'folder')}
              />
            );
          }}
        </Tab.Screen>
        <Tab.Screen name="Notes" options={{ title: 'Notes' }}>
          {() => {
            useFocusEffect(
              React.useCallback(() => {
                setActiveTab('Notes');
              }, [])
            );
            if (selectedNote) {
              return (
                <NoteContent 
                  noteTitle={selectedNote}
                  onGoBack={() => setSelectedNote(null)}
                  onRenameNote={handleRenameNote}
                />
              );
            }
            return (
              <NoteList
                files={directoryContent.files}
                onNoteDelete={(name) => handlePrepareDelete(name, 'file')}
                onNotePress={handleNotePress} 
                currentPath={currentDirectory.uri}
              />
            );
          }}
        </Tab.Screen>
        <Tab.Screen name="Settings" options={{title: 'Settings'}}>
          {() => {
            useFocusEffect(
              React.useCallback(() => {
                setActiveTab('Settings');
              }, [])
            );
            return <SettingsScreen />;
          }}
        </Tab.Screen>
      </Tab.Navigator>
      {
        activeTab === 'Folders' && (
          <FloatingButton icon={<FolderPlus color="#fff" />} onPress={handleCreateFolder} />
        )
      }
      {
        activeTab === 'Notes' && (
          <FloatingButton icon={<StickyNote color="#fff" />} onPress={handleCreateFile} />
        )
      }
      <PromptModal
        visible={modalVisible}
        title={modalType === 'folder' ? 'Create New Folder' : 'Create New Note'}
        message={modalType === 'folder' ? 'Enter a name for the new folder:' : 'Enter a name for the new note and select a file type:'}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
        isNoteCreation={modalType === 'file'} 
      />
      <ConfirmationModal
        visible={deleteModalVisible}
        title={`Delete ${itemToDelete?.type === 'folder' ? 'Folder' : 'File'}`}
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#fff',
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Explorer;