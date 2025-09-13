import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Trash2, StickyNote, FileCode2 } from 'lucide-react-native';

interface NoteListProps {
  files: string[]; 
  onNoteDelete: (fileName: string) => void;
  onNotePress: (fileName: string) => void; 
  currentPath: string;
}

const NoteList: React.FC<NoteListProps> = ({ files, onNoteDelete, onNotePress, currentPath}) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const getFormattedPathHeader = (path: string) => {
    const sanitizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
    
    const pathParts = sanitizedPath.split('/');

    const lastPart = pathParts[pathParts.length - 1];

    const rootDirName = 'notes';
    if (lastPart.toLowerCase() === rootDirName.toLowerCase()) {
      return 'My Notes';
    }
    return lastPart;
  };

  const sortedFiles = [...files].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.localeCompare(b);
    } else {
      return b.localeCompare(a);
    }
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const renderNoteItem = ({ item }: { item: string }) => {
    const fileNameWithoutExtension = item.split('.').slice(0, -1).join('.');
    const fileExtension = item.split('.').pop();
    const isMarkdown = fileExtension === 'md';
    const isHtml = fileExtension === 'html';
    
    const noteIcon = isHtml ? <FileCode2 size={24} color="#E44D26" /> : <StickyNote size={24} color="#000" />;
    const noteItemBackgroundColor = isHtml ? '#F0E68C' : '#E6E6FA'; // HTML: Khaki, Markdown: Lavender

    return (
      <View style={[styles.noteItemContainer, { backgroundColor: noteItemBackgroundColor }]}>
        <TouchableOpacity style={styles.noteItem} onPress={() => onNotePress(item)}>
          <View style={styles.iconAndExtension}>
            {noteIcon}
            {fileExtension && (
              <Text style={styles.noteExtension}>{fileExtension.toUpperCase()}</Text>
            )}
          </View>
          <Text style={styles.noteTitle}>{fileNameWithoutExtension}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onNoteDelete(item)}
          style={styles.deleteButton}
        >
          <Trash2 size={20} color="#888" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{getFormattedPathHeader(currentPath)}</Text>
        <TouchableOpacity onPress={toggleSortOrder} style={styles.sortButton}>
          <Text style={styles.sortButtonText}>
            Sort: {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={sortedFiles} 
        renderItem={renderNoteItem}
        keyExtractor={item => item}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notes found.</Text>
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
    paddingHorizontal: 15,
    backgroundColor: '#F5F5F5', 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  sortButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
  },
  sortButtonText: {
    fontWeight: 'bold',
    color: '#555',
  },
  noteItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 15,
    paddingLeft: 20,
  },
  iconAndExtension: {
    alignItems: 'center',
    width: 40,
  },
  noteTitle: {
    fontSize: 17,
    color: '#000',
    fontWeight: '600',
    marginLeft: 15,
  },
  noteExtension: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
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
    marginTop: 80,
  },
  emptyText: {
    fontSize: 22,
    color: '#A0A0A0',
    marginBottom: 8,
    fontWeight: '500',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#A0A0A0',
  },
});

export default NoteList;