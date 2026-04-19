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




export type CompletedTask = {
  courseName: string;
  taskName: string;
  attempts: number;
  date: any;
};

export type ChartSeries = { labels: string[]; values: number[] };

export type UserStats = {
  totalTasks: number;
  medianAttempts: number;
  stdDevAttempts: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
  weeklyAverage: number;
  improvementSlope: number;
};

const DAY_MS = 86_400_000;
const MONTHS_FI = ["Tam","Hel","Maa","Huh","Tou","Kes","Hei","Elo","Syy","Lok","Mar","Jou"];

const toDate = (v: any): Date | null =>
  v?.toDate?.() ?? (v?.seconds ? new Date(v.seconds * 1000) : null);

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export const fetchCompletedTasks = async (userId: string): Promise<CompletedTask[]> => {
  const snap = await getDoc(doc(db, "users", userId));
  return (snap.data()?.completedTasks ?? []) as CompletedTask[];
};

const countBy = (tasks: CompletedTask[], bucket: (d: Date) => number | null) => {
  const counts = new Map<number, number>();
  for (const t of tasks) {
    const d = toDate(t.date);
    const key = d && bucket(d);
    if (key == null) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
};

export const tasksByDayOfMonth = (tasks: CompletedTask[]): ChartSeries => {
  const now = new Date();
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const counts = countBy(tasks, (d) =>
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      ? d.getDate()
      : null,
  );
  return {
    labels: Array.from({ length: days }, (_, i) => String(i + 1)),
    values: Array.from({ length: days }, (_, i) => counts.get(i + 1) ?? 0),
  };
};

export const tasksByMonth = (tasks: CompletedTask[]): ChartSeries => {
  const year = new Date().getFullYear();
  const counts = countBy(tasks, (d) => (d.getFullYear() === year ? d.getMonth() : null));
  return {
    labels: MONTHS_FI,
    values: MONTHS_FI.map((_, i) => counts.get(i) ?? 0),
  };
};

export const tasksByYear = (tasks: CompletedTask[]): ChartSeries => {
  const counts = countBy(tasks, (d) => d.getFullYear());
  const years = [...counts.keys()].sort((a, b) => a - b);
  if (years.length === 0) return { labels: [String(new Date().getFullYear())], values: [0] };
  return { labels: years.map(String), values: years.map((y) => counts.get(y)!) };
};

const median = (xs: number[]) => {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const stdDev = (xs: number[]) => {
  if (xs.length === 0) return 0;
  const mean = xs.reduce((s, n) => s + n, 0) / xs.length;
  return Math.sqrt(xs.reduce((s, n) => s + (n - mean) ** 2, 0) / xs.length);
};

// Least-squares slope of attempts over completion order; negative = improving.
const trendSlope = (xs: number[]) => {
  const n = xs.length;
  if (n < 2) return 0;
  const meanX = (n - 1) / 2;
  const meanY = xs.reduce((s, v) => s + v, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (xs[i] - meanY);
    den += (i - meanX) ** 2;
  }
  return den ? num / den : 0;
};

const streaks = (dayKeys: Set<string>) => {
  if (dayKeys.size === 0) return { longest: 0, current: 0 };

  const sorted = [...dayKeys]
    .map((k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m, d).getTime(); })
    .sort((a, b) => a - b);

  let longest = 1, run = 1;
  for (let i = 1; i < sorted.length; i++) {
    run = Math.round((sorted[i] - sorted[i - 1]) / DAY_MS) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  let current = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (dayKeys.has(dayKey(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { longest, current };
};

export const computeUserStats = (tasks: CompletedTask[]): UserStats => {
  const attempts = tasks.map((t) => t.attempts).filter(Number.isFinite);
  const dated = tasks
    .map((t) => ({ attempts: t.attempts, date: toDate(t.date) }))
    .filter((t): t is { attempts: number; date: Date } => t.date !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const dayKeys = new Set(dated.map((t) => dayKey(t.date)));
  const { longest, current } = streaks(dayKeys);

  let weeklyAverage = 0;
  if (dated.length > 0) {
    const spanDays =
      Math.ceil((dated[dated.length - 1].date.getTime() - dated[0].date.getTime()) / DAY_MS) + 1;
    weeklyAverage = (tasks.length / spanDays) * 7;
  }

  return {
    totalTasks: tasks.length,
    medianAttempts: median(attempts),
    stdDevAttempts: stdDev(attempts),
    activeDays: dayKeys.size,
    currentStreak: current,
    longestStreak: longest,
    weeklyAverage,
    improvementSlope: trendSlope(dated.map((t) => t.attempts)),
  };
};
