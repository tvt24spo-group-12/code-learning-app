import { db } from "../../firebaseConfig";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { auth } from "../../firebaseConfig";

export interface CourseActivity {
  courseId: string;
  courseName: string;
  lastAccessed: Date;
  completedExercises: number;
  totalExercises: number;
}

export const getRecentCourseActivity = async (): Promise<CourseActivity[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  // Fetch user's completedTasks array from user document
  const userDoc = await getDoc(doc(db, "users", user.uid));
  const userData = userDoc.data();
  const completedTasks = userData?.completedTasks || [];

  const courseTaskMap = new Map<string, any[]>();

  for (const task of completedTasks) {
    const courseId = task.courseName;
    if (!courseId) continue;

    if (!courseTaskMap.has(courseId)) {
      courseTaskMap.set(courseId, []);
    }

    courseTaskMap.get(courseId)!.push(task);
  }

  // For each course with completed tasks, fetch total task count
  const activities: CourseActivity[] = [];

  for (const [courseId, tasks] of courseTaskMap) {
    try {
      const tasksSnapshot = await getDocs(
        collection(db, "Courses", courseId, "Tasks"),
      );
      const totalExercises = tasksSnapshot.size;

      const lastDate = tasks.reduce((latest: Date, t: any) => {
        const d = t.date?.toDate ? t.date.toDate() : new Date();
        return d > latest ? d : latest;
      }, new Date(0));

      const uniqueTasks = new Set(tasks.map((t: any) => t.taskName)).size;

      activities.push({
        courseId,
        courseName: courseId,
        lastAccessed: lastDate,
        completedExercises: uniqueTasks,
        totalExercises: totalExercises || tasks.length,
      });
    } catch (error) {
      console.error(`Error fetching tasks for course ${courseId}:`, error);
    }
  }

  return activities;
};
