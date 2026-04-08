export interface CourseActivity {
  courseId: string;
  courseName: string;
  lastAccessed: Date;
  completedExercises: number;
  totalExercises: number;
}

// TODO: Replace with real activity tracking from Firebase
export const getRecentCourseActivity = async (): Promise<CourseActivity[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          courseId: "cpp-mock",
          courseName: "C++ perusteet",
          lastAccessed: new Date("2026-03-28"),
          completedExercises: 3,
          totalExercises: 10,
        },
        {
          courseId: "js-intro",
          courseName: "JavaScript aloittelijoille",
          lastAccessed: new Date("2026-03-27"),
          completedExercises: 7,
          totalExercises: 12,
        },
        {
          courseId: "python-101",
          courseName: "Python 101",
          lastAccessed: new Date("2026-03-25"),
          completedExercises: 1,
          totalExercises: 8,
        },
      ]);
    }, 500);
  });
};
