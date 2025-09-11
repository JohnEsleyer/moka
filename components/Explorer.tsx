import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { NavigationContainer, NavigationContainerRef, useFocusEffect } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import FoldersScreen from './FoldersScreen';
import NoteList from './NoteList';
import FloatingMenu from './FloatingMenu';
import PromptModal from './PromptModal';
import ConfirmationModal from './ConfirmationModal';
import NoteContent from './NoteContent'; 
import { FolderPlus, StickyNote, ArrowLeft, Cog } from 'lucide-react-native';
import SettingsScreen from './SettingsScreen';

const ROOT_DIRECTORY = 'notes';
const ROOT_PATH = `${FileSystem.documentDirectory}${ROOT_DIRECTORY}/`;
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

const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(ROOT_PATH);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(ROOT_PATH, { intermediates: true });
  }
};

const Explorer = () => {
  const [directoryContent, setDirectoryContent] = useState<DirectoryContent>({
    folders: [],
    files: [],
  });
  const [currentPath, setCurrentPath] = useState(ROOT_PATH);
  const [activeTab, setActiveTab] = useState<string>('Folders');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'folder' | 'file' | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<{ name: string, type: 'folder' | 'file' } | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null); 
  const [showSettingsButton, setShowSettingsButton] = useState<boolean>(true);

  const settingsMenu = [
    { id: '1', icon: <Cog />, onPress: () => navigationRef.current?.navigate('Settings') }
  ]


  const navigationRef = useRef<NavigationContainerRef<any | null>>(null);

  const [isLoading, setIsLoading] = useState(true);


  const handleRenameNote = async (oldTitle: string, newTitle: string) => {
    try{
      const oldPath = `${currentPath}${oldTitle}`;
      const newPath = `${currentPath}${newTitle}`;

      const content = await FileSystem.readAsStringAsync(oldPath);
      
      await FileSystem.deleteAsync(oldPath, {idempotent: true});

      await FileSystem.writeAsStringAsync(newPath, content);

      setSelectedNote(newTitle);
      listItems();
    }catch(error){
      console.error('Failed to rename note:', error);
      Alert.alert('Error', 'Failed to rename note');

      setSelectedNote(oldTitle);
    }
  }


  const listItems = async () => {
    setIsLoading(true);
    const newDirectoryContent: DirectoryContent = { folders: [], files: [] };
    try {
      await ensureDirExists();
      const items: string[] = await FileSystem.readDirectoryAsync(currentPath);
      for (const item of items) {
        const itemPath: string = `${currentPath}${item}`;
        const info: FileSystem.FileInfo = await FileSystem.getInfoAsync(itemPath);
        if (info.isDirectory) {
          newDirectoryContent.folders.push(item);
        } else {
          newDirectoryContent.files.push(item);
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
    const newPath = `${currentPath}${folderName}/`;
    setCurrentPath(newPath);
  };

  const goBack = () => {
    if (currentPath !== ROOT_PATH) {
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/', currentPath.length - 2) + 1);
      setCurrentPath(parentPath);
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

        const newPath = `${currentPath}${name}/`;
        

        if (modalType === 'folder') {
          const dirInfo = await FileSystem.getInfoAsync(newPath);
          if (dirInfo.exists && dirInfo.isDirectory){
            Alert.alert("Error", `A folder named "${name}" already exists.`);
            return;
          }
          const newFolderPath = `${currentPath}${name}/`;
          await FileSystem.makeDirectoryAsync(newFolderPath);
        } else if (modalType === 'file') {
          
          const finalExtension = fileExtension || 'md'; 
          const fileNameWithExtension = name.endsWith(`.${finalExtension}`) ? name : `${name}.${finalExtension}`;
          const newFilePath = `${currentPath}${fileNameWithExtension}`;
          const fileInfo = await FileSystem.getInfoAsync(newFilePath);
          if (fileInfo.exists && !fileInfo.isDirectory){
            Alert.alert("Error", `A file named "${fileNameWithExtension} already exists.`);
            return;
          }
          
          await FileSystem.writeAsStringAsync(newFilePath, '');
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
      const itemPath = `${currentPath}${itemToDelete.name}`;
      await FileSystem.deleteAsync(itemPath, { idempotent: true });
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

  const folderMenus = [
    { id: 'create-folder', icon: <FolderPlus />, onPress: handleCreateFolder }
  ];

   const fileMenus = [
    { id: 'create-file', icon: <StickyNote />, onPress: handleCreateFile }
  ];


  useEffect(() => {
    listItems();
  }, [currentPath]);

   useEffect(() => {
    if (activeTab === 'Folders') {
        setMenuItems(folderMenus);
    } else if (activeTab === 'Notes') {
        setMenuItems(fileMenus);
    } else { 
        setMenuItems([]);
    }
  }, [activeTab]);


  return (
    <NavigationContainer>
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
                  isRoot={currentPath === ROOT_PATH}
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
                  currentPath={currentPath}
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
        <FloatingMenu menuItems={menuItems} />
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
    </NavigationContainer>
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