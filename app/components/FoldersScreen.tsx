import { Folder, ArrowLeft, Trash2, Search } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';

type FoldersScreenProps = {
  folders: string[];
  isRoot: boolean;
  onFolderPress: (folderName: string) => void;
  onGoBack: () => void;
  onFolderDelete: (folderName: string) => void;
};

const FoldersScreen: React.FC<FoldersScreenProps> = ({ folders, isRoot, onFolderPress, onGoBack, onFolderDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredAndSortedFolders = useMemo(() => {
    const filtered = searchQuery
      ? folders.filter(folder => folder.toLowerCase().includes(searchQuery.toLowerCase()))
      : folders;

    return [...filtered].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.localeCompare(b);
      } else {
        return b.localeCompare(a);
      }
    });
  }, [folders, searchQuery, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {!isRoot && (
          <TouchableOpacity onPress={onGoBack} style={styles.backButton}>
            <ArrowLeft size={20} color="#555" />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.searchAndSortContainer}>
          <View style={styles.searchBarContainer}>
            <Search size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search folders..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity onPress={toggleSortOrder} style={styles.sortButton}>
            <Text style={styles.sortButtonText}>
              Sort: {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={filteredAndSortedFolders}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <View style={styles.folderItemContainer}>
            <TouchableOpacity
              onPress={() => onFolderPress(item)}
              style={styles.folderItem}
            >
              <Folder size={24} color="#333" />
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
            {searchQuery ? (
              <Text style={styles.emptySubtitle}>No results for "{searchQuery}"</Text>
            ) : (
              <Text style={styles.emptySubtitle}>Tap the '+' to create one.</Text>
            )}
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginLeft: 10,
  },
  searchAndSortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  sortButton: {
    marginLeft: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sortButtonText: {
    fontWeight: 'bold',
    color: '#555',
  },
  listContent: {
    paddingHorizontal: 15,
  },
  folderItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  folderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingLeft: 20,
    flex: 1,
  },
  folderText: {
    fontSize: 18,
    color: '#333',
    marginLeft: 15,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 20,
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
    fontSize: 22,
    color: '#A0A0A0',
    marginBottom: 5,
    fontWeight: '500',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#A0A0A0',
  },
});

export default FoldersScreen;