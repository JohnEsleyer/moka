import { Directory, File, Paths } from 'expo-file-system';

const notesDirectory = new Directory(Paths.document, 'notes');

async function ensureDirExists() {
  await notesDirectory.create({ intermediates: true });
}

/**
 * Saves a note to a file.
 * @param {string} fileName The name of the file (e.g., "my-note.txt").
 * @param {string} content The content of the note to save.
 */
export const saveNote = async (fileName: string, content: string) => {
  try {
    await ensureDirExists();
    const noteFile = new File(notesDirectory, fileName);
    await noteFile.write(content);
    // Corrected: Use .uri instead of .path
    console.log(`Note saved successfully at ${noteFile.uri}`);
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
    const noteFile = new File(notesDirectory, fileName);
    const fileInfo = await noteFile.info();
    if (fileInfo.exists) {
      const content = await noteFile.text();
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
    const noteFile = new File(notesDirectory, fileName);
    const fileInfo = await noteFile.info();
    if (fileInfo.exists) {
      await noteFile.delete();
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
    const items = await notesDirectory.list();
    const fileNames = items.filter(item => item.name.endsWith('.txt')).map(item => item.name);
    return fileNames;
  } catch (e) {
    console.error('Failed to get note files:', e);
    return [];
  }
};