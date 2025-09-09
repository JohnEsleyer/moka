import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import FoldersScreen from './FoldersScreen';
import FilesScreen from './FilesScreen';
import FloatingMenu from './FloatingMenu';
import PromptModal from './PromptModal';
import { FolderPlus, StickyNote } from 'lucide-react-native';
import ConfirmationModal from './ConfirmationModal';

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
  const [folderToDelete, setFolderToDelete] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);


  const handleDeleteFolder = (folderName: string): void => {
    setFolderToDelete(folderName);
    setDeleteModalVisible(true);
  }

  const handleDeleteConfirm = async (): Promise<void> => {
    try {
      const folderPath: string = `${currentPath}${folderToDelete}`;
      await FileSystem.deleteAsync(folderPath, {idempotent: true});
      listItems();
    }catch(error: any){
      Alert.alert('Error', `Failed to delete folder: ${error.message}`);
    } finally {
      setDeleteModalVisible(false);
      setFolderToDelete('');
    }
  }

  const handleDeleteCancel = (): void => {
    setDeleteModalVisible(false);
    setFolderToDelete('');
  };

  const listItems = async () => {
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


  const handleModalConfirm = async (name: string) => {
    if (name && name.trim().length > 0) {
      try {
        if (modalType === 'folder') {
          const newFolderPath = `${currentPath}${name}/`;
          await FileSystem.makeDirectoryAsync(newFolderPath);
        } else if (modalType === 'file') {
          const fileNameWithExtension = name.endsWith('.md') ? name : `${name}.md`;
          const newFilePath = `${currentPath}${fileNameWithExtension}`;
          await FileSystem.writeAsStringAsync(newFilePath, '');
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

  const folderMenus = [
    { id: '1', icon: <FolderPlus />, onPress: handleCreateFolder }
  ];

  const fileMenus = [
    { id: '1', icon: <StickyNote />, onPress: handleCreateFile }
  ];

  useEffect(() => {
    listItems();

  }, [currentPath]);

  useEffect(() => {
    if (activeTab === 'Folders') {
      setMenuItems(folderMenus);
    } else {
      setMenuItems(fileMenus);
    }
  }, [activeTab]);

  return (
    <NavigationContainer>
      <View style={styles.container}>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#0000ff',
            tabBarInactiveTintColor: 'gray',
            tabBarLabelStyle: { fontSize: 16, fontWeight: 'bold', padding: 2, paddingTop: 12 },
            tabBarStyle: { backgroundColor: '#fff' },
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
                  onFolderDelete={handleDeleteFolder}
                  onGoBack={goBack}
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
         
              return <FilesScreen files={directoryContent.files} />;
            }}
          </Tab.Screen>
        </Tab.Navigator>
        <FloatingMenu menuItems={menuItems} />
        <PromptModal
          visible={modalVisible}
          title={modalType === 'folder' ? 'Create New Folder' : 'Create New File'}
          message={modalType === 'folder' ? 'Enter a name for the new folder:' : 'Enter a name for the new file. A .md extension will be added.'}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
        <ConfirmationModal 
          visible={deleteModalVisible}
          title="Delete Folder"
          message={`Are you sure you want to delete ${folderToDelete}? This action cannot be undone.`}
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
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Explorer;