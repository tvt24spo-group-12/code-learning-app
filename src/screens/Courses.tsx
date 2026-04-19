import { ArrowLeft, Check, ChevronRight, ListX, ListCheck } from 'lucide-react-native';
import React, { useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from "../context/ThemeContext";
import { checkifDone, fetchTasks, getCourses } from '../services/exerciseService';
import { createGlobalStyles } from "../theme/globalStyles";
import { getTheme } from "../theme/theme";
import { Exercise } from '../types/exercise';

interface CompletedTask {
  courseName: string;
  taskName: string;
  attempts?: number;
  date?: any;
}

const CoursePage = ({ navigation, route }: any) => {
  const [exercises, setExercises] = useState<Exercise[]>([]); // Käytetään useState johdonmukaisesti
  const [loading, setLoading] = useState(true);
  const [title, setTitle] =useState<string[]>([])
  const [userid, setUserId] = useState<string>("")
  const [completedTasks,setCompletedTasks] = useState<CompletedTask[]>([])
  const {userProfile} = useAuth()
  const selectedCourseId = route?.params?.courseId;
  const { theme } = useTheme();
  const globalStyles = createGlobalStyles(theme);
  const colors = getTheme(theme);
  const styles = createStyles(colors);

  const handleBack = () => {
    navigation.setParams({ courseId: undefined });
  };

  useLayoutEffect(() => {
    if (selectedCourseId) {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity onPress={handleBack} style={{ marginLeft: 8 }}>
            <ArrowLeft size={24} color={colors.text} />
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
    setUserId(userProfile?.uid || "")

    if(userid=== "" || userid.length=== 0){
      setLoading(true)
    }else{
      setLoading(false)
      fetchExercises();
    }

  }, [userid,userProfile,selectedCourseId]);

  // Refresh completed tasks when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (userid) {
        refreshCompletedTasks();
      }
    }, [userid])
  );

  const refreshCompletedTasks = async () => {
    try {
      const completedtasks = await checkifDone(userid);
      setCompletedTasks(completedtasks);
    } catch (error) {
      console.error('Error refreshing completed tasks:', error);
    }
  };

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

  const groupedExercises = exercises.reduce((acc, exercise) => {
    const existing = acc.find(group => group.courseId === exercise.courseId);
    if (existing) {
      existing.exercises.push(exercise);
    } else {
      acc.push({ courseId: exercise.courseId, exercises: [exercise] });
    }
    return acc;
  }, [] as Array<{ courseId: string; exercises: Exercise[] }>);

  const renderItem = ({ item }: { item: { courseId: string; exercises: Exercise[] } }) => (
    <View>
      {!selectedCourseId && (
        <TouchableOpacity
          style={[globalStyles.card, { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, justifyContent: 'space-between' }]}
          onPress={() => {
            navigation.setParams({ courseId: item.courseId })
          }}
        >
          <Text style={styles.courseTitle}>{item.courseId}</Text>
          <ChevronRight size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      )}

      {selectedCourseId === item.courseId && (
        <>
          <Text style={styles.courseTitle}>{item.courseId}</Text>

          {item.exercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              style={[globalStyles.card, { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16 }]}
              onPress={() => {
                if(exercise.type === "code-challenge"){
                  navigation.navigate('CodingScreen', {exercise: exercise})
                }
                else{
                  navigation.navigate('ExerciseDetail', { exerciseId: exercise.id, title: exercise.title, courseId: exercise.courseId })
                }
              }}
            >
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{exercise.title}</Text>
                <Text style={styles.cardSubtitle}>{exercise.description}</Text>
              </View>
              {completedTasks?.some(task => task.taskName === exercise.id && task.courseName === exercise.courseId) ? (
                <ListCheck size={24} color={colors.success} />
              ) : (
                <ListX size={24} color={colors.danger} />
              )}
            </TouchableOpacity>
          ))}
        </>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={globalStyles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={globalStyles.screenContainer}>
      <FlatList
        data={groupedExercises}
        renderItem={renderItem}
        keyExtractor={item => item.courseId} 
        contentContainerStyle={createStyles(colors).listContent}
      />
    </SafeAreaView>
  );
  
};

const createStyles = (colors: any) => StyleSheet.create({
  listContent: { 
    padding: 20
  },
  cardInfo: { 
    flex: 1 
  },
  cardTitle: { 
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 12, 
    color: colors.textSecondary,
    marginTop: 2 
  },
  courseTitle: { 
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
    marginTop: 10,
  }
});
export default CoursePage;
