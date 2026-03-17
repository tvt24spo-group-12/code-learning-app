import React from 'react';
import { View, Text, StyleSheet } from 'react-native';



export default function AccountPage() {
   return(
        <View style={styles.container}>
            <Text style={styles.text}>AccountPage!</Text>
          
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