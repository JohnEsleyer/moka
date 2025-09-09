import { Folder, ArrowLeft, Trash2 } from 'lucide-react-native';
import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

type FoldersScreenProps = {
  folders: string[];
  isRoot: boolean;
  onFolderPress: (folderName: string) => void;
  onGoBack: () => void;
  onFolderDelete: (folderName: string) => void;
};

const FoldersScreen: React.FC<FoldersScreenProps> = ({ folders, isRoot, onFolderPress, onGoBack, onFolderDelete }) => {
  return (
    <View style={styles.container}>
      <FlatList
        data={folders}
        keyExtractor={item => item}
        ListHeaderComponent={!isRoot ? (
          <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
            <ArrowLeft size={20} color="#000" />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        ) : null}
        renderItem={({ item }) => (
          <View style={styles.folderItemContainer}>
            <TouchableOpacity
              onPress={() => onFolderPress(item)}
              style={styles.folderItem}
            >
              <Folder size={24} color="#000" />
              <Text style={styles.folderText}>{item}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onFolderDelete(item)}
              style={styles.deleteButton}
            >
              <Trash2 size={24} color="#888" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No folders found.</Text>
            <Text style={styles.emptySubtitle}>Tap the '+' to create one.</Text>
          </View>
        }
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
    marginLeft: 8,
  },
  folderItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Pushes children to opposite ends
    marginBottom: 10,
    backgroundColor: '#eee',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingLeft: 20,
    flex: 1, // Fills available space
  },
  folderText: {
    fontSize: 18,
    color: '#000',
    marginLeft: 15,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 20,
    color: '#888',
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
  },
});

export default FoldersScreen;