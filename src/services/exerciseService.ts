import { MOCK_EXERCISES } from '../data/mockExercises';
import { Exercise } from '../types/exercise';

// Ota myöhemmin käyttöön Firebase hakun, mutta toistaiseksi käytetään mock-dataa
export const getExercises = async (): Promise<Exercise[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_EXERCISES);
    }, 800);
  });
};

export const getExerciseById = async (id: string): Promise<Exercise | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_EXERCISES.find(e => e.id === id));
    }, 400);
  });
};
