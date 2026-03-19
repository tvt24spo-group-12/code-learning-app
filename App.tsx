import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Tabs from './src/components/naviGationBar';
import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Tabs />
        <StatusBar style="auto" />
      </NavigationContainer>
    </ThemeProvider>
  );
}