import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { createGlobalStyles } from '../theme/globalStyles';


export default function CoursePage() {
  const { theme } = useTheme();
  const globalStyles = createGlobalStyles(theme);

   return(
        <View style={[globalStyles.screenContainer, { paddingTop: 20 }]}>
            <Text style={globalStyles.heading}>CoursePage!</Text>
          
        </View>
    );
}