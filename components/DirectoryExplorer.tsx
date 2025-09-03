import React, { useState, useEffect, JSX } from 'react';
import { View, Text, StyleSheet, Button, FlatList, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { FileInfo } from 'expo-file-system';
import KeyboardAvoidingComponent from '../sandbox';
import FloatingMenu from './FloatingMenu';
import { SettingsIcon, FolderPlus, StickyNote } from 'lucide-react-native';

const ROOT_DIRECTORY: string = 'notes'
const ROOT_PATH: string = `${FileSystem.documentDirectory}${ROOT_DIRECTORY}/`;

const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(ROOT_PATH);
  if (!dirInfo.exists){
    console.log("Directory doesn't exist, creating...");
    await FileSystem.makeDirectoryAsync(ROOT_PATH, {intermediates: true});
  }
}

export default function DirectoryExplorer(): JSX.Element {
  const [currentPath, setCurrentPath] = useState<string>(ROOT_PATH);
  const [directories, setDirectories] = useState<string[]>([]);
  const [newDirName, setNewDirName] = useState<string>('');

  // Menu Items
  const myMenuItems = [
    {
      id: '3',
      icon: <SettingsIcon size={24} color="#fff" />,
      onPress: () => console.log('Share pressed'),
    },
    {
      id: '1',
      icon: <FolderPlus size={24} color="#fff" />,
      onPress: () => console.log('Add location pressed'),
    },
    {
      id: '2',
      icon: <StickyNote size={24} color="#fff" />,
      onPress: () => console.log('Edit pressed'),
    },
 
  ];

  // Fetch directories in the current path
  const fetchDirectories = async (path: string): Promise<void> => {
    try {
      const items: string[] = await FileSystem.readDirectoryAsync(path);
      const dirInfoList: {name: string; date: number}[] = [];

       for (const item of items) {
        const itemPath: string = `${path}${item}`;
        const info: FileInfo = await FileSystem.getInfoAsync(itemPath);
        if (info.isDirectory) {
          dirInfoList.push({
            name: item, 
            date: info.modificationTime,
          });
        }
      }

      // Sort the directories by date in descending order (newest first)
      dirInfoList.sort((a, b) => b.date - a.date);
      setDirectories(dirInfoList.map(dir => dir.name));
    } catch (error) {
      console.error('Failed to read directory:', error);
      Alert.alert('Error', 'Failed to read directory.');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await ensureDirExists();
      fetchDirectories(currentPath);
    }

    loadData();
   
  }, [currentPath]);

  const handleCreateDirectory = async (): Promise<void> => {
    if (!newDirName) {
      Alert.alert('Error', 'Directory name cannot be empty.');
      return;
    }
    const newDirPath: string = `${currentPath}${newDirName}/`;
    try {
      await FileSystem.makeDirectoryAsync(newDirPath);
      Alert.alert('Success', `Directory '${newDirName}' created.`);
      setNewDirName('');
      fetchDirectories(currentPath); // Refresh the list
    } catch (error) {
      console.error('Failed to create directory:', error);
      Alert.alert('Error', 'Failed to create directory.');
    }
  };

  const handleDeleteDirectory = async (dirName: string): Promise<void> => {
    const dirPath: string = `${currentPath}${dirName}`;
    try {
      await FileSystem.deleteAsync(dirPath, { idempotent: true });
      Alert.alert('Success', `Directory '${dirName}' deleted.`);
      fetchDirectories(currentPath); // Refresh the list
    } catch (error) {
      console.error('Failed to delete directory:', error);
      Alert.alert('Error', 'Failed to delete directory.');
    }
  };

  const handleNavigate = (dirName: string): void => {
    const newPath: string = `${currentPath}${dirName}/`;
    setCurrentPath(newPath);
  };

  const handleGoBack = (): void => {
    if (currentPath === ROOT_PATH) {
      return; // Cannot go back from the root
    }
    const parentPath: string = currentPath.substring(0, currentPath.lastIndexOf('/', currentPath.length - 2) + 1);
    setCurrentPath(parentPath);
  };

  interface RenderItemProps {
    item: string;
  }

  const renderItem = ({ item }: RenderItemProps): JSX.Element => (
    <View style={styles.directoryItem}>
      <TouchableOpacity onPress={() => handleNavigate(item)} style={styles.directoryInfo}>
        <Text style={styles.directoryText}>{item}</Text>
      </TouchableOpacity>
      <Button title="Delete" onPress={() => handleDeleteDirectory(item)} color="red" />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.pathText}>Current Path: {ROOT_PATH}</Text>

      {currentPath !== ROOT_PATH && (
        <Button title="Go Back" onPress={handleGoBack} />
      )}

      <FlatList
        data={directories}
        renderItem={renderItem}
        keyExtractor={(item: string) => item}
        style={styles.list}
      />
      
      <FloatingMenu menuItems={myMenuItems} />
 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  pathText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  list: {
    flex: 1,
    width: '100%',
  },
  directoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  directoryInfo: {
    flex: 1,
  },
  directoryText: {
    fontSize: 16,
  },
  creator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
});