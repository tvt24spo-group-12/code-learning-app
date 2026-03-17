import React from 'react';
import { View, Text, StyleSheet } from 'react-native';



export default function CoursePage() {
   return(
        <View style={styles.container}>
            <Text style={styles.text}>CoursePage!</Text>
          
        </View>
    );
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