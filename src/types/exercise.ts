export type ExerciseType = 'multiple-choice' | 'code-challenge';

export interface Exercise {
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
  attempts:Number;
  done?:Boolean;
}
