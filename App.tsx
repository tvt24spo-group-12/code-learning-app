import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Tabs from './src/components/naviGationBar';
import { ThemeProvider } from './src/context/ThemeContext';
import ExerciseScreen from './src/screens/ExerciseScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
   <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {/* Alapalkin navigaatio (Tabs) on pääsivu */}
          <Stack.Screen 
            name="MainTabs" 
            component={Tabs}
            options={{ headerShown: false }} 
          />
          
          {/* Yksittäinen tehtäväsivu, joka avautuu välilehtien päälle */}
          <Stack.Screen 
            name="ExerciseDetail" 
            component={ExerciseScreen} 
            options={({ route }) => ({ 
              title: route.params?.title || 'Exercise Detail',
              headerBackTitle: 'Back', 
            })} 
          />
        </Stack.Navigator>
        
        <StatusBar style="auto" />
      </NavigationContainer>
    </ThemeProvider>
  );
}