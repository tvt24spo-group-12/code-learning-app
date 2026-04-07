export type ExerciseType = 'multiple-choice' | 'code-challenge';

export interface Exercise {
  courseId:string;
  id: string;
  title: string;
  description: string;
  language: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: ExerciseType;
  question: string;
  options?: string[];
  correctAnswer: string;
  initialCode?: string;
  attempts:number;
  done?:boolean;
}
