import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Exercise } from '../types/exercise';
import { ChevronRight, Code, ListCheck } from 'lucide-react-native';
import { getCourses, fetchTasks } from '../services/exerciseService';
import {Check} from "lucide-react-native"
const CoursePage = ({ navigation }: any) => {
  const [exercises, setExercises] = useState<Exercise[]>([]); // Käytetään useState johdonmukaisesti
  const [loading, setLoading] = useState(true);
  const [title, setTitle] =useState<string[]>([])
  useEffect(() => {

            
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const courses = await getCourses()
      const courseIds= courses.map(course=>course.id)
     setTitle(courseIds)
      const data = await fetchTasks(courseIds)

      
   
      setExercises(data)
    
        
      
    } catch (error) {
      console.error('Error fetching:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Exercise }) => (
    <><View>
      {title.map(s => s.toString() == item.courseId) && (
        <Text style={styles.courseTitle}>{item.courseId}</Text>
      )}
    </View><TouchableOpacity

      style={styles.card}
      // Varmista, että 'ExerciseDetail' on määritelty StackNavigatorissa!
      onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.id, title: item.title, courseId: item.courseId })}
    >
        <View style={styles.cardInfo}>

          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.description}</Text>
          {item.done && <Check color="#32aa14"></Check>}

        </View>
        <ChevronRight size={18} color="#666" />
      </TouchableOpacity></>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={exercises}
        renderItem={renderItem}
        keyExtractor={item => item.id} 
        contentContainerStyle={styles.list}
       
      />
    </SafeAreaView>
    
  );
  
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    
  },text : {
    fontSize:20,
    fontWeight: 'bold'
  },
   list: { 
    padding: 20
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: { 
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f9f9f9',
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1, shadowRadius: 3 
},
  cardInfo: { 
  flex: 1 
},
  cardTitle: { 
  fontSize: 16,
  fontWeight: 'bold',
  color: '#000',
},
  cardSubtitle: {
  fontSize: 12, 
  color: '#666',
  marginTop: 2 
},
 headerTitle: { 
  fontSize: 22, 
  fontWeight: 'bold', 
  color: '#000', 
  marginBottom: 20
},courseTitle: { 
  fontSize: 20,
  fontWeight: 'bold',
  color: '#000',
  marginBottom:10,
  marginTop:10,
},
});
export default CoursePage;
