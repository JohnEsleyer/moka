import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

type FilesScreenProps = {
  files: string[];
};

const FilesScreen: React.FC<FilesScreenProps> = ({ files }) => {
  return (
    <View style={styles.listContainer}>
      <FlatList
        data={files}
        keyExtractor={item => item}
        renderItem={({ item }) => <Text style={styles.item}>{item}</Text>}
        ListEmptyComponent={<Text>No files found.</Text>}
      />
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
});

export default FilesScreen;