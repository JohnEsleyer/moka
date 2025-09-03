import { FolderPlus, StickyNote } from 'lucide-react-native';
import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import FloatingMenu from './FloatingMenu';

type FoldersScreenProps = {
  folders: string[];
  isRoot: boolean;
  onFolderPress: (folderName: string) => void;
  onGoBack: () => void;
};

 const menuItems = [
    {
      id: '1',
      icon: <FolderPlus/>,
      onPress: () => {}
    },
  ]

const FoldersScreen: React.FC<FoldersScreenProps> = ({ folders, isRoot, onFolderPress, onGoBack }) => {
  return (
    <View style={styles.listContainer}>
      {!isRoot && (
        <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={folders}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onFolderPress(item)}>
            <Text style={styles.item}>{item}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No folders found.</Text>}
      />
     <FloatingMenu menuItems={menuItems}/>
      
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    padding: 20,
  },
  item: {
    fontSize: 16,
    paddingVertical: 5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    width: 100,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default FoldersScreen;