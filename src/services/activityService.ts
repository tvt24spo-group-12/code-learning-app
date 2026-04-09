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

/**
 * Parses completedTasks entries like "C++MockCourse_Variable_Attemps:1"
 * Returns a map of courseId -> set of task names
 */
function parseCompletedTasks(
  completedTasks: Record<string, string>,
): Map<string, string[]> {
  const courseTaskMap = new Map<string, string[]>();

  for (const value of Object.values(completedTasks)) {
    if (!value || !value.includes("_")) continue;

    // Format: CourseName_TaskName_Attemps:N
    const attemptsIdx = value.lastIndexOf("_Attempt");
    if (attemptsIdx === -1) continue;

    const courseAndTask = value.substring(0, attemptsIdx);
    const firstUnderscore = courseAndTask.indexOf("_");
    if (firstUnderscore === -1) continue;

    const courseId = courseAndTask.substring(0, firstUnderscore);
    const taskName = courseAndTask.substring(firstUnderscore + 1);

    if (!courseTaskMap.has(courseId)) {
      courseTaskMap.set(courseId, []);
    }
    courseTaskMap.get(courseId)!.push(taskName);
  }

  return courseTaskMap;
}

export const getRecentCourseActivity = async (): Promise<CourseActivity[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  // Fetch user's completedTasks array from user document
  const userDoc = await getDoc(doc(db, "users", user.uid));
  const userData = userDoc.data();
  const completedTasksArray: string[] = userData?.completedTasks || [];

  const courseTaskMap = parseCompletedTasks(
    Object.fromEntries(completedTasksArray.map((v, i) => [String(i), v])),
  );

  // For each course with completed tasks, fetch total task count
  const activities: CourseActivity[] = [];

  for (const [courseId, completedTaskNames] of courseTaskMap) {
    try {
      const tasksSnapshot = await getDocs(
        collection(db, "Courses", courseId, "Tasks"),
      );
      const totalExercises = tasksSnapshot.size;

      activities.push({
        courseId,
        courseName: courseId,
        lastAccessed: new Date(),
        completedExercises: completedTaskNames.length,
        totalExercises: totalExercises || completedTaskNames.length,
      });
    } catch (error) {
      console.error(`Error fetching tasks for course ${courseId}:`, error);
    }
  }

  return activities;
};
