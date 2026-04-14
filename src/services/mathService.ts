import { MOCK_EXERCISES } from '../data/mockExercises';
import { Exercise } from '../types/exercise';
import { db } from "../../firebaseConfig";
import { arrayUnion, collection, doc, getDoc, getDocs, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore"; 
import { useState } from 'react';
import { ConciergeBellIcon, Percent } from 'lucide-react-native';
import { checkifDone } from './exerciseService';


export const countAverage = async(userId:string)=>{
  const completedTasks=doc(db,"users",userId)
 

    try{
     
        const data = await getDoc(completedTasks);
        const completedData:[]=data.data()?.completedTasks || [];
        const totalAttemps = completedData.map((task:any)=> task.attempts)
        
        const averageCompletion = totalAttemps.reduce((sum,n)=>sum+n,0) / totalAttemps.length
        return averageCompletion
 
    }catch(error){
        console.log("something went wrong: ", error)
    }
}

export const successRate = async(userId:string) =>{
      const completedTasks=doc(db,"users",userId)
 

    try{
     
        const data = await getDoc(completedTasks);
        const completedData:[]=data.data()?.completedTasks || [];
        const totalAttemps = completedData.map((task:any)=> task.attempts)
        
        const successRate = (totalAttemps.length/totalAttemps.reduce((sum,n)=>sum+n,0)) *100
        return successRate
 
    }catch(error){
        console.log("something went wrong: ", error)
    }
}




