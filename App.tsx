import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Sandbox from './sandbox';
import * as FileSystem from 'expo-file-system';
import DirectoryExplorer from './components/DirectoryExplorer';


export default function App() {

  return (

     <DirectoryExplorer/>
  
  );
}