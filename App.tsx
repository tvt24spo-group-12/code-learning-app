import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Tabs from '../code-learning-app/src/components/naviGationBar'
import { NavigationContainer } from '@react-navigation/native';
export default function App() {
  return (
     <NavigationContainer>
      
      <Tabs/>
    
     
      <StatusBar style="auto" />
      </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
