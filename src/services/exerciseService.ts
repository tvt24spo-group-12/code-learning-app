import { MOCK_EXERCISES } from '../data/mockExercises';
import { Exercise } from '../types/exercise';
import { db } from "../../firebaseConfig";
import { arrayUnion, collection, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore"; 
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
  if(!data.exists()) return[];
  const completedData = data.data()?.completedTasks || [];
  return completedData.filter((task:any)=> task.courseName && task.taskName);
  }catch(error){
    console.log(error)
  }
}

export const setDone= async(courseId:string, exerciseId:string, attempts:number, userId:string, points:number)=>{
 
 // const task = doc(db,"Courses",courseId,"Tasks",exerciseId)
  const user = doc(db,"users",userId)
  try{
    const isDone= await checkifDone(userId)
    const done = isDone.some((task:any) => task.courseName === courseId && task.taskName === exerciseId)
    if(done){
      console.log("already done")
      return
    }
  await updateDoc(user,{
completedTasks: arrayUnion({
      courseName: courseId,
       taskName:exerciseId,
        attempts:attempts,
         date: Timestamp.now(),
        points:points
        }),
  })
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


export const countPoints = async(difficulty:string, attempts:number)=>{
  const Pointmultipier:number = attempts*0.20 //0.20 on kerroin joka vähentää pisteiden määrää
  switch(difficulty){
    case 'easy':{
    if(attempts === 1){
      return 1
    }
       const points = (1-Pointmultipier).toFixed(2)
       if(Number(points) <= 0.00){
        return 0
       }
      return points
    }
    case 'medium':{
      if(attempts === 1){
        return 2
      }
      const points = (2-Pointmultipier).toFixed(2)
         if(Number(points) <= 0.00){
        return 0
       }
      return points
    }
    case 'hard':{
      if(attempts === 1){
        return 3
      }
      const points = (3-Pointmultipier).toFixed(2)
         if(Number(points) <= 0.00){
        return 0
       }
      return points
    }
    default:
      {
        break;
      }
  }


}
