import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
//import { getExerciseById } from '../services/exerciseService';
import { Exercise } from '../types/exercise';
import { Check, X } from 'lucide-react-native';
import { getCourses } from '../services/exerciseService';

const ExerciseScreen = ({ route }: any) => {
  const { exerciseId,title } = route.params;
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        setLoading(true);
       const data = await getCourses();
      const assingment = data.find((e)=>e.id===exerciseId)
      setExercise(assingment??null)
      } catch (error) {
        console.error('Error fetching exercise:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId]);

  const checkAnswer = (option: string) => {
    setSelectedOption(option);
    const correct = option === exercise?.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      Alert.alert('Good!', 'Excellent work!', [{ text: 'Excellent' }]);
    } else {
      Alert.alert('Ouch!', 'Try again!', [{ text: 'OK' }]);
    }
  };

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color='#666' />
    </View>
  );

  if (!exercise) return (
    <View style={styles.centered}>
      <Text>Exercise not found.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.languageText}>{exercise.language}</Text>
          <Text style={styles.questionText}>{exercise.question}</Text>
          <Text style={styles.descriptionText}>{exercise.description}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {exercise.options?.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedOption === option && isCorrect === true && styles.correctOption,
                selectedOption === option && isCorrect === false && styles.wrongOption,
              ]}
              onPress={() => !selectedOption && checkAnswer(option)}
              disabled={selectedOption !== null}
            >
              <Text style={[styles.optionText, selectedOption === option && styles.selectedOptionText]}>
                {option}
              </Text>
              {selectedOption === option && isCorrect === true && <Check size={18} color="#FFF" />}
              {selectedOption === option && isCorrect === false && <X size={18} color="#FFF" />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 20, elevation: 2 },
  languageText: { color: '#666', marginBottom: 5 },
  questionText: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  descriptionText: { fontSize: 16, color: '#444' },
  optionsContainer: { gap: 10 },
  optionButton: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  optionText: { fontSize: 16 },
  selectedOptionText: { color: '#fff', fontWeight: 'bold' },
  correctOption: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  wrongOption: { backgroundColor: '#F44336', borderColor: '#F44336' },
});

export default ExerciseScreen;