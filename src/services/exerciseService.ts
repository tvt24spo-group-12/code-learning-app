import { MOCK_EXERCISES } from '../data/mockExercises';
import { Exercise } from '../types/exercise';
import { db } from "../../firebaseConfig";
import { arrayUnion, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore"; 
import { useState } from 'react';
import { ConciergeBellIcon, Percent } from 'lucide-react-native';

export const getCourses= async()=>{

 const querySnapshot = await getDocs(collection(db, "Courses"));
const courses: Exercise[] = querySnapshot.docs.map((doc)=>({

  id:doc.id,
  ...doc.data(),
}as Exercise))

return courses

}

export const checkifDone=async(userid:string)=>{
  const completedTasks=doc(db,"users",userid)

  try{
  const data = await getDoc(completedTasks);
  return data.exists() ? data.data()?.completedTasks || [] : [];
  }catch(error){
    console.log(error)
  }
}

export const setDone= async(courseId:string, exerciseId:string, attempts:number, userId:string)=>{
 
 // const task = doc(db,"Courses",courseId,"Tasks",exerciseId)
  const user = doc(db,"users",userId)
  try{

  await updateDoc(user,{
    completedTasks: arrayUnion(`${courseId}_${exerciseId}_Attempts:${attempts}`)
  });
  
}catch(error){
  console.error(error)
}
}

export const fetchTasks= async(Courseid:string[]):Promise<Exercise[]>=>{

  const tasks = await Promise.all(
    Courseid.map(async(id)=>{
      const courseSnapshot= await getDocs(collection(db,"Courses", id,"Tasks"))
      return courseSnapshot.docs.map((doc)=>{
        const data = doc.data()
        return{
    id:doc.id,
    courseId: id,
   ...doc.data(),
        } as Exercise
   
  }) 
 
    })
  )
return tasks.flat() as Exercise[]

  
}

export const getTask = async (courseId: string, exerciseId: string): Promise<Exercise | null> => {
  const task = doc(db, "Courses", courseId, "Tasks", exerciseId);
  const snapshot = await getDoc(task);
  return {
    ...(snapshot.data() as Exercise),
    id: snapshot.id,
  };
};

