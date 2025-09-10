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
    const isMarkdown = item.endsWith('.md');
    const isHtml = item.endsWith('.html');
    
    const noteIcon = isHtml ? <FileCode2 size={24} color="#E44D26" /> : <StickyNote size={24} color="#000" />;
    const noteItemStyle = isHtml ? styles.htmlNoteItem : styles.markdownNoteItem;

    return (
      <View style={[styles.noteItemContainer, noteItemStyle]}>
        <TouchableOpacity style={styles.noteItem} onPress={() => onNotePress(item)}>
          {noteIcon}
          <Text style={styles.noteText}>{item}</Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sortButton: {
    padding: 8,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  sortButtonText: {
    fontWeight: 'bold',
  },
  noteItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  markdownNoteItem: {
    backgroundColor: '#E6E6FA',
  },
  htmlNoteItem: {
    backgroundColor: '#F0E68C',
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 15,
    paddingLeft: 20,
  },
  noteText: {
    fontSize: 16,
    color: '#000',
    marginLeft: 15,
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

export default NoteList;