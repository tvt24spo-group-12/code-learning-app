import { View, Text, StyleSheet } from 'react-native';
import * as React from 'react'


export default function SettingsPage() {
  
    return(
        <View style={styles.container}>
            <View>
            <Text style={styles.text}>SettingsPage!</Text>
            </View>
            
      
        </View>
    )
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },text : {
    fontSize:20,
    fontWeight: 'bold'
  }
});