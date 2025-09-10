import * as FileSystem from 'expo-file-system';

const notesDirectory = `${FileSystem.documentDirectory}notes/`;

// Ensure the notes directory exists
async function ensureDirExists() {
  const dirInfo = await FileSystem.getInfoAsync(notesDirectory);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(notesDirectory, { intermediates: true });
  }
}

/**
 * Saves a note to a file.
 * @param {string} fileName The name of the file (e.g., "my-note.txt").
 * @param {string} content The content of the note to save.
 */
export const saveNote = async (fileName: string, content: string) => {
  try {
    await ensureDirExists();
    const filePath = `${notesDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(filePath, content);
    console.log(`Note saved successfully at ${filePath}`);
  } catch (e) {
    console.error('Failed to save note:', e);
  }
};

/**
 * Reads the content of a note from a file.
 * @param {string} fileName The name of the file (e.g., "my-note.txt").
 * @returns {Promise<string>} The content of the note, or an empty string if the file doesn't exist.
 */
export const readNote = async (fileName: string) => {
  try {
    const filePath = `${notesDirectory}${fileName}`;
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(filePath);
      return content;
    }
    return '';
  } catch (e) {
    console.error('Failed to read note:', e);
    return '';
  }
};

/**
 * Deletes a note file.
 * @param {string} fileName The name of the file to delete.
 */
export const deleteNote = async (fileName: string) => {
  try {
    const filePath = `${notesDirectory}${fileName}`;
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(filePath);
      console.log(`Note deleted successfully: ${fileName}`);
    } else {
      console.warn(`Attempted to delete a file that does not exist: ${fileName}`);
    }
  } catch (e) {
    console.error('Failed to delete note:', e);
  }
};

/**
 * Reads all note files from the notes directory.
 * @returns {Promise<string[]>} An array of note file names.
 */
export const getNoteFiles = async () => {
  try {
    await ensureDirExists();
    const files = await FileSystem.readDirectoryAsync(notesDirectory);
    return files.filter(file => file.endsWith('.txt')); // assuming all notes are .txt
  } catch (e) {
    console.error('Failed to get note files:', e);
    return [];
  }
};