import { MOCK_EXERCISES } from '../data/mockExercises';
import { Exercise } from '../types/exercise';
import { db } from "../../firebaseConfig";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore"; 
import { useState } from 'react';
import { Percent } from 'lucide-react-native';


// Ota myöhemmin käyttöön Firebase hakun, mutta toistaiseksi käytetään mock-dataa
export const getExercises = async (): Promise<Exercise[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_EXERCISES);
    }, 800);
  });
};



export const getCourses= async()=>{

 const querySnapshot = await getDocs(collection(db, "Courses","C++MockCourse","MockTask"));

return querySnapshot.docs.map((doc)=>({
id:doc.id,
...(doc.data() as Omit<Exercise, "id">),


}))
}


