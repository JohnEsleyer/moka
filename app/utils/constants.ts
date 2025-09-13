import { Directory, Paths } from 'expo-file-system';

const notesDirectory = new Directory(Paths.document, 'notes');
export const notesDirectoryURI = notesDirectory.uri;
export const API_KEY_FILE = 'apiKey.txt';

console.log(`Directory URI: ${notesDirectoryURI}`);