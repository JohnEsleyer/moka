import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import FoldersScreen from './FoldersScreen';
import FilesScreen from './FilesScreen';
import FloatingMenu from './FloatingMenu';
import { FolderPlus, StickyNote } from 'lucide-react-native';

const ROOT_DIRECTORY = 'notes';
const ROOT_PATH = `${FileSystem.documentDirectory}${ROOT_DIRECTORY}/`;

const Tab = createMaterialTopTabNavigator();

const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(ROOT_PATH);
  if (!dirInfo.exists) {
    console.log("Notes directory doesn't exist, creating...");
    await FileSystem.makeDirectoryAsync(ROOT_PATH, { intermediates: true });
  }
};

const Explorer = () => {
  const [folders, setFolders] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState(ROOT_PATH);

  const listItems = async () => {
    try {
      await ensureDirExists();
      const items: string[] = await FileSystem.readDirectoryAsync(currentPath);

      const folderNames: string[] = [];
      const fileNames: string[] = [];

      for (const item of items) {
        const itemPath: string = `${currentPath}${item}`;
        const info: FileSystem.FileInfo = await FileSystem.getInfoAsync(itemPath);

        if (info.isDirectory) {
          folderNames.push(item);
        } else {
          fileNames.push(item);
        }
      }

      setFolders(folderNames);
      setFiles(fileNames);
    } catch (error) {
      console.error("Failed to list items:", error);
      Alert.alert('Error', 'Failed to read directory contents.');
    } finally {

        setLoading(false);

     
    }
  };

  const navigateToFolder = (folderName: string) => {
    const newPath = `${currentPath}${folderName}/`;
    setCurrentPath(newPath);
  };

  const goBack = () => {
    if (currentPath !== ROOT_PATH) {
      // Find the parent directory by removing the last part of the path
      const parentPath = currentPath.substring(0, currentPath.lastIndexOf('/', currentPath.length - 2) + 1);
      setCurrentPath(parentPath);
    }
  };

  useEffect(() => {
    setLoading(true);
    listItems();
  }, [currentPath]);

  // if (loading) {
  //   return (
  //     <View style={styles.container}>
  //       <ActivityIndicator size="large" color="#0000ff" />
  //     </View>
  //   );
  // }


  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#0000ff',
          tabBarInactiveTintColor: 'gray',
          tabBarLabelStyle: { fontSize: 16, fontWeight: 'bold', padding: 2, paddingTop: 12},
          tabBarStyle: { backgroundColor: '#fff' },
        }}
      >
        <Tab.Screen name="Folders" options={{ title: 'Folders' }}>
          {() => (
            <FoldersScreen
              folders={folders}
              isRoot={currentPath === ROOT_PATH}
              onFolderPress={navigateToFolder}
              onGoBack={goBack}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Notes" options={{ title: 'Notes' }}>
          {() => <FilesScreen files={files} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Explorer;