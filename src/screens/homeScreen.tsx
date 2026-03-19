import * as React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { createGlobalStyles } from '../theme/globalStyles';


export default function HomeScreen() {
  const { theme } = useTheme();
  const globalStyles = createGlobalStyles(theme);
  
    return(
        <View style={[globalStyles.screenContainer, { paddingTop: 20 }]}>
            <Text style={globalStyles.heading}>Home</Text>
        </View>
    )
}