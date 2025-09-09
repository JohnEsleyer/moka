import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Trash2, StickyNote } from 'lucide-react-native';

interface NoteListProps {
  files: string[]; // Updated to accept a files prop
  onNoteDelete: (fileName: string) => void;
}

const NoteList: React.FC<NoteListProps> = ({ files, onNoteDelete }) => {
  const renderNoteItem = ({ item }: { item: string }) => (
    <View style={styles.noteItemContainer}>
      <TouchableOpacity style={styles.noteItem}>
        <StickyNote size={24} color="#000" />
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

  return (
    <View style={styles.container}>
      <FlatList
        data={files} // Use the files prop here
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
  noteItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    backgroundColor: '#eee',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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