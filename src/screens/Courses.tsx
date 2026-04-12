import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from "../context/ThemeContext";
import { createGlobalStyles } from "../theme/globalStyles";
import { getTheme } from "../theme/theme";
import { Exercise } from '../types/exercise';
import { ChevronRight, Code, ListCheck } from 'lucide-react-native';
import { getCourses, fetchTasks,checkifDone } from '../services/exerciseService';
import {Check, ArrowLeft} from "lucide-react-native"
import { useAuth } from '../context/AuthContext';
const CoursePage = ({ navigation, route }: any) => {
  const [exercises, setExercises] = useState<Exercise[]>([]); // Käytetään useState johdonmukaisesti
  const [loading, setLoading] = useState(true);
  const [title, setTitle] =useState<string[]>([])
  const [userid, setUserId] = useState<string>("")
  const [completedTasks,setCompletedTasks] = useState<string[]>([])
  const {userProfile} = useAuth()
  const selectedCourseId = route?.params?.courseId;
    const { theme } = useTheme();
    const globalStyles = createGlobalStyles(theme);
const [selectedId, setSelectedId] = useState<string|null>(null)
  const handleBack = () => {
    if (selectedCourseId) {
      navigation.setParams({ courseId: undefined });
    } else {
      navigation.goBack();
    }
  };

  useLayoutEffect(() => {
    if (selectedCourseId) {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity onPress={handleBack} style={{ marginLeft: 8 }}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
        ),
      });
    } else {
      navigation.setOptions({
        headerLeft: undefined,
      });
    }
  }, [selectedCourseId]);

  useEffect(() => {
    setSelectedId(null)
    setUserId(userProfile?.uid || "")

    if(userid=== "" || userid.length=== 0){
      setLoading(true)
    }else{
      setLoading(false)
      fetchExercises();
    }

  }, [userid,userProfile,selectedCourseId,setSelectedId]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const courses = await getCourses()
      let courseIds = courses.map(course=>course.id)

      if (selectedCourseId) {
        courseIds = courseIds.filter(id => id === selectedCourseId);
      }

     setTitle(courseIds)
      const data = await fetchTasks(courseIds)
  
    const completedtasks = await checkifDone(userid)
     
      setCompletedTasks(completedtasks)

      
   
      setExercises(data)
    
        
      
    } catch (error) {
      console.error('Error fetching:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Exercise }) => (
  
    <>
   {selectedId === null &&( <TouchableOpacity

      style={styles.card}
      // Varmista, että 'ExerciseDetail' on määritelty StackNavigatorissa!
      onPress={() => {
    
        setSelectedId(item.courseId)}}
    >
          <Text style={styles.courseTitle}>{item.courseId}</Text>

    
        <ChevronRight size={18} color="#666" />

      
      </TouchableOpacity>)}
      
        {selectedId === item.courseId&&(
          <>
         
          <TouchableOpacity onPress={()=>{setSelectedId(null)}}><ArrowLeft/></TouchableOpacity>
           <Text style={styles.courseTitle}>{item.courseId}</Text>
          
          <TouchableOpacity
         
              style={styles.card}
               onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.id, title: item.title, courseId: item.courseId })}
              >
        <View style={styles.cardInfo}>

          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.description}</Text>
           {completedTasks?.map(task=>task === item.id)&&<Check color="#32aa14"></Check>}

        </View>
     
              </TouchableOpacity>
                
                
              </>
        )}
      </>
   
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
}
});
export default CoursePage;
